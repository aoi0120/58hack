const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
