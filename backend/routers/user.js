const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();

//ユーザー名の変更API
router.post("/rename", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "新しい名前を入力してください。" });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name }
        });
        return res.status(200).json({ name: updatedUser.name });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "ユーザー名の更新に失敗しました。" });
    }
});

module.exports = router;
