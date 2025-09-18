const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// バトルログ記録API
router.post("/result", async (req, res) => {
  const { winnerId, loserId, date } = req.body;
  if (!winnerId || !loserId || !date) {
    return res.status(400).json({ message: "必要なデータがありません" });
  }
  try {
    const battle = await prisma.battleRecord.create({
      data: {
        winnerId,
        loserId,
        date: new Date(date),
      },
    });
    res.status(201).json(battle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
