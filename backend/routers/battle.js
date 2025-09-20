const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// すれ違った瞬間の記録API（勝敗判定も同時に行う）
router.post('/encounter', authMiddleware, async (req, res) => {
	const userId = req.userId;
	const { opponentId, mySteps, opponentSteps } = req.body;

	if (!userId || !opponentId || mySteps === undefined || opponentSteps === undefined) {
		return res.status(400).json({ message: '必要なデータがありません' });
	}

	try {
		// 既に同じ相手とのバトル記録があるかチェック
		const existingBattle = await prisma.battleRecord.findFirst({
			where: {
				OR: [
					{ winnerId: userId, loserId: parseInt(opponentId) },
					{ winnerId: parseInt(opponentId), loserId: userId },
				],
			},
		});

		if (existingBattle) {
			return res.status(400).json({
				message: 'この相手とは既にバトル済みです',
				battleId: existingBattle.id,
				alreadyBattled: true,
			});
		}

		// 勝敗を判定
		const isWinner = mySteps >= opponentSteps;
		const winnerId = isWinner ? userId : parseInt(opponentId);
		const loserId = isWinner ? parseInt(opponentId) : userId;
		const winnerSteps = isWinner ? mySteps : opponentSteps;
		const loserSteps = isWinner ? opponentSteps : mySteps;

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

		res.status(201).json({
			battleId: battle.id,
			winner: isWinner ? 'me' : 'opponent',
			mySteps,
			opponentSteps,
			alreadyBattled: false,
		});
	} catch (err) {
		console.error(err);
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

//勝利数保存API
router.get("/total_wins", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "ユーザーIDがありません" });

  try {
    const totalWins = await prisma.battleRecord.count({
      where: { winnerId: userId },
    });
    res.status(200).json({ totalWins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
