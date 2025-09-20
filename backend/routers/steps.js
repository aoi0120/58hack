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
	const stepsNum = Number(steps);
	const dateObj = new Date(date);
	const isInvalidDate = Number.isNaN(dateObj.getTime());

	if (!userId || !stepsNum || !dateObj || isInvalidDate) {
		return res.status(400).json({ message: '不正な入力です' });
	}

	try {
		// 既に同じ日付の歩数データがあるかを判定
		const existing = await prisma.stepRecord.findFirst({
			where: { userId, date: dateObj },
		});

		let result;
		if (existing) {
			// 歩数を上書き
			result = await prisma.stepRecord.update({
				where: { id: existing.id },
				data: { steps: stepsNum },
			});
		} else {
			// 歩数を新規作成
			result = await prisma.stepRecord.create({
				data: { userId, date: dateObj, steps: stepsNum },
			});
		}

		return res.status(200).json(result);
	} catch (err) {
		console.error(err);
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
