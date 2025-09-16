const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { name, email, password, age } = req.body;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      age,
    },
  });

  return res.json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: "そのユーザーは存在しません。" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: "そのパスワードは間違っています。" });
  }

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    //有効期限
    expiresIn: "1d",
  });

  return res.json({ token });
});

module.exports = router;
