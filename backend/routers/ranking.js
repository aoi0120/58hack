const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/steps", async (req, res) => {
  const { date, daysCount } = req.body;
  const endDate = new Date(date);
  if (
    isNaN(endDate.getTime()) ||
    typeof daysCount !== "number" ||
    daysCount < 1
  ) {
    return res.status(400).json({ message: "不正な入力です" });
  }
  // daysCount日前の0時
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (daysCount - 1));
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
    const users = await prisma.user.findMany();
    const userSteps = await Promise.all(
      users.map(async (user) => {
        // daysCount日分の歩数合計
        const sumResult = await prisma.stepRecord.aggregate({
          _sum: { steps: true },
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });
        return {
          user,
          steps: sumResult._sum.steps || 0,
        };
      })
    );

    // 歩数で降順ソート
    userSteps.sort((a, b) => b.steps - a.steps);

    // 順位付け（同じ歩数は同じ順位）
    let rank = 1;
    let prevSteps = null;
    let prevRank = 1;
    const ranked = userSteps.map((item, idx) => {
      if (item.steps !== prevSteps) {
        rank = idx + 1;
        prevSteps = item.steps;
        prevRank = rank;
      }
      return {
        rank: prevRank,
        steps: item.steps,
        user: item.user,
      };
    });

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

// 勝率ランキングAPI
router.post("/winrate", async (req, res) => {
  const { date, daysCount } = req.body;
  const endDate = new Date(date);
  if (
    isNaN(endDate.getTime()) ||
    typeof daysCount !== "number" ||
    daysCount < 1
  ) {
    return res.status(400).json({ message: "不正な入力です" });
  }
  // daysCount日前の0時
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (daysCount - 1));
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
    const users = await prisma.user.findMany();
    // 指定期間のバトル履歴取得
    const battles = await prisma.battleRecord.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 各ユーザーの勝率計算
    const userRates = users.map((user) => {
      const winCount = battles.filter((b) => b.winnerId === user.id).length;
      const loseCount = battles.filter((b) => b.loserId === user.id).length;
      const totalGames = winCount + loseCount;
      const winRate = totalGames > 0 ? winCount / totalGames : 0;
      return {
        user,
        winCount,
        loseCount,
        winRate,
      };
    });

    // 勝率で降順ソート
    userRates.sort((a, b) => b.winRate - a.winRate);

    // 順位付け（同じ勝率は同じ順位）
    let rank = 1;
    let prevRate = null;
    let prevRank = 1;
    const ranked = userRates.map((item, idx) => {
      if (item.winRate !== prevRate) {
        rank = idx + 1;
        prevRate = item.winRate;
        prevRank = rank;
      }
      return {
        rank: prevRank,
        winRate: item.winRate,
        winCount: item.winCount,
        loseCount: item.loseCount,
        user: item.user,
      };
    });

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
