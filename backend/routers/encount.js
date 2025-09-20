const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();
const EID_EXPIRATION_MS = 60 * 60 * 1000; // 1時間

// Eid_keyの生成と更新を行う
router.get("/generate", authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const existing = await prisma.eid_key.findFirst({ where: { userId } });
        const now = new Date();
        // 生成したeid_keyの消失 or 生成から1時間以上の条件式
        if (!existing || now - existing.createdAt > EID_EXPIRATION_MS) {
            // 新しいeid_keyを作成（Prismaのuuid生成に任せる）
            const newEid = await prisma.eid_key.create({
                data: { userId }
            });
            return res.json({ eid: newEid.eid });
        }
        return res.json({ eid: existing.eid });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "EID生成エラー" });
    }
});

// すれ違いを記録
router.post("/Recording", authMiddleware, async (req, res) => {
    // "記録する人" -> "recorder"
    const recorderUserId = req.userId;
    const { eid } = req.body;
    if (!eid) return res.status(400).json({ error: "eidが必要です" });

    try {
        const eidKey = await prisma.eid_key.findUnique({ where: { eid } });
        if (!eidKey) return res.status(404).json({ error: "相手のeidが見つかりません" });

        // 有効期限チェック
        if (new Date() - eidKey.createdAt > EID_EXPIRATION_MS) {
            return res.status(400).json({ error: "eidの有効期限が切れています" });
        }

        // 自分自身との遭遇は記録しない
        if (recorderUserId === eidKey.userId) {
            return res.status(400).json({ error: "自分自身は記録できません" });
        }

        const encounter = await prisma.encounters.create({
            data: {
                recorderUserId,
                recordedUserId: eidKey.userId,
                done_battle: false
            }
        });
        return res.status(201).json(encounter);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "遭遇記録エラー" });
    }
});

module.exports = router;