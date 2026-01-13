import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireAiTokens } from "../middlewares/aiToken.middleware.js";
import { chatWithAssistant, voiceAssistant } from "../controllers/ai.controller.js";

const router = Router();

router.post(
    "/chat",
    authMiddleware,
    requireAiTokens("CHAT"),
    chatWithAssistant
);

router.post(
    "/voice",
    authMiddleware,
    requireAiTokens("VOICE"),
    voiceAssistant
);

export default router;
