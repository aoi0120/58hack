const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();

//ユーザーの新規登録API
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, age } = req.body || {};
        if (!name || !email || !password || !age) {
            return res.status(400).json({ error: "必須項目が入力されていません" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "このメールアドレスは既に使用されています" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                age: parseInt(age, 10),
            },
        });

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1d",
            }
        );

        const refreshToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: "7d",
        });

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
            },
            token,
            refreshToken,
        });
    } catch (error) {
        console.error("ユーザー登録エラー:", error);
        return res.status(500).json({ error: "サーバーエラーです" });
    }
});

//ユーザーのログインAPI
router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: "必須項目が入力されていません" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ error: "そのユーザーは存在しません。" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ error: "そのパスワードは間違っています。" });
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            age: user.age,
        },
        process.env.SECRET_KEY,
        {
            //有効期限
            expiresIn: "1d",
        }
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
    });

    return res.json({
        token,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            age: user.age,
        },
    });
});

// トークンリフレッシュAPI
router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "リフレッシュトークンが必要です" });
        }

        // リフレッシュトークンを検証
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);

        // ユーザーが存在するか確認
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "ユーザーが見つかりません" });
        }

        // 新しいアクセストークンを生成
        const newToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1d",
            }
        );

        return res.json({ token: newToken });
    } catch (error) {
        console.error("トークンリフレッシュエラー:", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "無効なリフレッシュトークンです" });
        }
        return res.status(500).json({ error: "サーバーエラーです" });
    }
});

// ユーザー情報取得API
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                age: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "ユーザーが見つかりません" });
        }

        return res.json({ user });
    } catch (error) {
        console.error("ユーザー情報取得エラー:", error);
        return res.status(500).json({ error: "サーバーエラーです" });
    }
});

module.exports = router;
