import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { handleVoiceCommand } from "./voice.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { requireAiTokens, precheckAiTokens } from "../../middlewares/ai.middleware.js";

const router = express.Router();

router.post(
    "/execute",
    authMiddleware,
    requireAiTokens(AiUsageType.VOICE),     // ⬅ REQUIRED
    precheckAiTokens(AiUsageType.VOICE),    // ⬅ REQUIRED
    upload.single("audio"),
    handleVoiceCommand
);


export default router;
