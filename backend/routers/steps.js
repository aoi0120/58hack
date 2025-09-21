const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// 昨日の歩数をDBに保存するAPI
// フロント側ではreqに"昨日"の日付をYYYY-MM-DDの形で渡す
router.post('/yesterday', authMiddleware, async (req, res) => {
	// jwtからuserIdを取得
	const userId = req.userId;
	const { steps, date } = req.body;

	const toSafeInt = (v) => {
		const n = Number(v);
		if (!Number.isFinite(n)) return null;
		return Math.trunc(n);
	};

	const stepsNum = toSafeInt(steps);
	if (!userId || stepsNum === null || stepsNum < 0 || !date) {
		return res.status(400).json({ message: '不正な入力です' });
	}

	// 入力された日付の0:00〜24:00の範囲を作成
	const start = new Date(date);
	if (Number.isNaN(start.getTime())) {
		return res.status(400).json({ message: '日付の形式が不正です' });
	}
	start.setHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	try {
		console.log('📝 歩数保存リクエスト:', {
			userId,
			steps: stepsNum,
			start: start.toISOString(),
			end: end.toISOString(),
		});

		// 既に同じ日付の歩数データがあるか（日付範囲で）
		const existing = await prisma.stepRecord.findFirst({
			where: {
				userId,
				date: { gte: start, lt: end },
			},
		});

		let result;
		if (existing) {
			result = await prisma.stepRecord.update({
				where: { id: existing.id },
				data: { steps: stepsNum },
			});
			console.log('✏️ 既存レコード更新:', { id: existing.id, steps: stepsNum });
		} else {
			// 正規化した日付(start)で作成
			result = await prisma.stepRecord.create({
				data: { userId, date: start, steps: stepsNum },
			});
			console.log('✅ 新規レコード作成:', { id: result.id, steps: stepsNum });
		}

		return res.status(200).json(result);
	} catch (err) {
		// 同時書き込みでユニーク制約に当たった場合は再取得して返す
		if (err && err.code === 'P2002') {
			const existing = await prisma.stepRecord.findFirst({
				where: { userId, date: { gte: start, lt: end } },
			});
			if (existing) return res.status(200).json(existing);
		}
		console.error('❌ 歩数保存エラー:', err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

// 昨日の歩数を取得するAPI
router.get('/yesterday', authMiddleware, async (req, res) => {
	const userId = req.userId;
	if (!userId) {
		return res.status(400).json({ message: 'ユーザーIDがありません' });
	}

	try {
		// 昨日の開始と終了（[start, end)）
		const start = new Date();
		start.setDate(start.getDate() - 1);
		start.setHours(0, 0, 0, 0);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		console.log('🔍 昨日の歩数取得開始:', {
			userId,
			start: start.toISOString(),
			end: end.toISOString(),
		});

		// 昨日の歩数データ（範囲検索）
		const records = await prisma.stepRecord.findMany({
			where: {
				userId: userId,
				date: { gte: start, lt: end },
			},
		});

		console.log('📊 昨日の歩数レコード:', {
			userId,
			recordCount: records.length,
			records: records.map((r) => ({ id: r.id, date: r.date, steps: r.steps })),
		});

		const steps = records.reduce((sum, r) => sum + (r.steps || 0), 0);

		console.log('✅ 昨日の歩数取得完了:', {
			userId,
			steps,
			date: start.toISOString().split('T')[0],
		});

		return res.status(200).json({
			steps,
			date: start.toISOString().split('T')[0],
		});
	} catch (err) {
		console.error('❌ 昨日の歩数取得エラー:', err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

// 今までの総歩数を渡すAPI
router.get('/total_steps', authMiddleware, async (req, res) => {
	const userId = req.userId;
	if (!userId) {
		return res.status(400).json({ message: 'ユーザーIDがありません' });
	}
	try {
		const total = await prisma.stepRecord.aggregate({
			_sum: { steps: true },
			where: { userId },
		});
		return res.status(200).json({ totalSteps: total._sum.steps || 0 });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

// ユーザーのレベル情報を取得するAPI
router.get('/user_level', authMiddleware, async (req, res) => {
	const userId = req.userId;
	if (!userId) {
		return res.status(400).json({ message: 'ユーザーIDがありません' });
	}
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { level: true, lastLevelUpAt: true },
		});
		return res.status(200).json({
			level: user?.level || 1,
			lastLevelUpAt: user?.lastLevelUpAt,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

// ユーザーのレベルを更新するAPI
router.post('/update_level', authMiddleware, async (req, res) => {
	const userId = req.userId;
	const { newLevel } = req.body;

	if (!userId || !newLevel) {
		return res.status(400).json({ message: 'ユーザーIDまたはレベルがありません' });
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				level: newLevel,
				lastLevelUpAt: new Date(),
			},
			select: { level: true, lastLevelUpAt: true },
		});

		return res.status(200).json({
			level: updatedUser.level,
			lastLevelUpAt: updatedUser.lastLevelUpAt,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

module.exports = router;
