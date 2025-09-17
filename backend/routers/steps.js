const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();

// 昨日の歩数をDBに保存するAPI
router.post("/yesterday", authMiddleware, async (req, res) => {
  // jwtからuserIdを取得
  const userId = req.userId;
  // dateは "YYYY-MM-DD"で渡し、DBには「その日の0時0分0秒」の日時として保存される
  const { steps, date } = req.body;
  const stepsNum = Number(steps);
  const dateObj = new Date(date);
  const isInvalidDate = Number.isNaN(dateObj.getTime());

  if (!userId || !stepsNum || !dateObj || isInvalidDate) {
    return res.status(400).json({ message: "不正な入力です" });
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
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
