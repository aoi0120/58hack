const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  //クライアントが渡す情報
  const { name, email } = req.body;

  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  });
  return res.json({ user });
});

module.exports = router;
