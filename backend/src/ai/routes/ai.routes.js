import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { executeAi, getHistory } from "../controllers/ai.controller.js";
import { requireAiTokens, precheckAiTokens } from "../../middlewares/ai.middleware.js";
import { AiUsageType } from "@prisma/client";

const router = Router();

router.post(
    "/execute",
    authMiddleware,
    requireAiTokens(AiUsageType.TEXT),   // ⬅ REQUIRED
    precheckAiTokens(AiUsageType.TEXT),  // ⬅ REQUIRED
    executeAi
);

router.get(
    "/history",
    authMiddleware,
    getHistory
);

router.get("/usage", authMiddleware, getMyUsage);


export default router;
