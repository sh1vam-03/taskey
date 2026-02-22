import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    createConversation,
    getConversations,
    getConversation,
    updateConversation,
    deleteConversation,
    getMessages,
    sendMessage,
    processVoiceMessage,
    transcribeVoice,
    synthesizeVoice,
} from "../controllers/ai.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

// ── Conversations ─────────────────────────────────────────────
router.post("/conversations", authMiddleware, createConversation);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/:id", authMiddleware, getConversation);   // ✅ FIX: was duplicated twice
router.put("/conversations/:id", authMiddleware, updateConversation);
router.delete("/conversations/:id", authMiddleware, deleteConversation);

// ── Messages (Text) ───────────────────────────────────────────
router.get("/conversations/:id/messages", authMiddleware, getMessages);
router.post("/conversations/:id/message", authMiddleware, sendMessage);

// ── Voice: Full pipeline ──────────────────────────────────────
// Single authoritative handler for voice messages.
// voice.routes.js no longer duplicates this route.
router.post(
    "/conversations/:id/voice",
    authMiddleware,
    upload.single("audio"),
    processVoiceMessage
);

// ── Voice Utilities ───────────────────────────────────────────
router.post("/voice/transcribe", authMiddleware, upload.single("audio"), transcribeVoice);
router.post("/voice/tts", authMiddleware, synthesizeVoice);

export default router;
