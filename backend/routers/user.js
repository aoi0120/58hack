const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/match/result", async (req, res) => {
  const { winnerId, loserId } = req.body;
  try {
    await prisma.user.update({
      where: { id: winnerId },
      data: { win_count: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: loserId },
      data: { lose_count: { increment: 1 } },
    });
    res.json({ message: "更新しました" });
  } catch (err) {
    res.status(500).json({ error: "更新失敗" });
  }
});

module.exports = router;
