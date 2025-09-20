const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// すれ違った瞬間の記録API（勝敗判定も同時に行う）
router.post('/encounter', authMiddleware, async (req, res) => {
	const userId = req.userId;
	const { opponentId, mySteps, opponentSteps } = req.body;

	console.log('⚔️ バトル記録作成リクエスト:', {
		userId,
		opponentId,
		mySteps,
		opponentSteps,
		timestamp: new Date().toISOString(),
	});

	// 32-bit signed int の安全範囲
	const INT_MIN = -2147483648;
	const INT_MAX = 2147483647;

	const toSafeInt = (v) => {
		const n = Number(v);
		if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
		if (n < INT_MIN || n > INT_MAX) return null;
		return n;
	};

	const safeOpponentId = toSafeInt(opponentId);
	const safeMySteps = toSafeInt(mySteps);
	const safeOpponentSteps = toSafeInt(opponentSteps);

	if (
		!toSafeInt(userId) ||
		!safeOpponentId ||
		safeMySteps === null ||
		safeOpponentSteps === null ||
		safeMySteps < 0 ||
		safeOpponentSteps < 0
	) {
		console.log('❌ バリデーションエラー: 範囲外または非整数の値', {
			userId,
			opponentId,
			mySteps,
			opponentSteps,
		});
		return res.status(400).json({ message: '入力値が不正です' });
	}

	try {
		// 対戦相手が存在するか確認（任意）
		const opponent = await prisma.user.findUnique({ where: { id: safeOpponentId } });
		if (!opponent) {
			return res.status(404).json({ message: '対戦相手が存在しません' });
		}

		// 既に同じ相手とのバトル記録があるかチェック
		const existingBattle = await prisma.battleRecord.findFirst({
			where: {
				OR: [
					{ winnerId: userId, loserId: safeOpponentId },
					{ winnerId: safeOpponentId, loserId: userId },
				],
			},
		});

		if (existingBattle) {
			console.log('⚠️ 既にバトル済み:', { battleId: existingBattle.id });
			return res.status(400).json({
				message: 'この相手とは既にバトル済みです',
				battleId: existingBattle.id,
				alreadyBattled: true,
			});
		}

		// 勝敗を判定（同数は自分勝ち）
		const isWinner = safeMySteps >= safeOpponentSteps;
		const winnerId = isWinner ? userId : safeOpponentId;
		const loserId = isWinner ? safeOpponentId : userId;
		const winnerSteps = isWinner ? safeMySteps : safeOpponentSteps;
		const loserSteps = isWinner ? safeOpponentSteps : safeMySteps;

		console.log('🏆 勝敗判定:', {
			isWinner,
			winnerId,
			loserId,
			winnerSteps,
			loserSteps,
		});

		// バトル記録を作成
		const battle = await prisma.battleRecord.create({
			data: {
				winnerId,
				loserId,
				date: new Date(),
				winnerSteps,
				loserSteps,
			},
		});

		console.log('✅ バトル記録作成完了:', {
			battleId: battle.id,
			winnerId: battle.winnerId,
			loserId: battle.loserId,
			winnerSteps: battle.winnerSteps,
			loserSteps: battle.loserSteps,
		});

		res.status(201).json({
			battleId: battle.id,
			winner: isWinner ? 'me' : 'opponent',
			mySteps: safeMySteps,
			opponentSteps: safeOpponentSteps,
			alreadyBattled: false,
		});
	} catch (err) {
		console.error('❌ バトル記録作成エラー:', err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

// バトルログ記録API
router.post('/result', async (req, res) => {
	const { winnerId, loserId, date, winnerSteps, loserSteps } = req.body;
	if (!winnerId || !loserId || !date || winnerSteps === undefined || loserSteps === undefined) {
		return res.status(400).json({ message: '必要なデータがありません' });
	}
	try {
		const battle = await prisma.battleRecord.create({
			data: {
				winnerId,
				loserId,
				date: new Date(date),
				winnerSteps: parseInt(winnerSteps),
				loserSteps: parseInt(loserSteps),
			},
		});
		res.status(201).json(battle);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'サーバーエラーです' });
	}
});

module.exports = router;
