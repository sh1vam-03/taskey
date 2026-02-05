import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { sendVoiceMessage } from "../voice/voice.controller.js";

const router = Router();

// Voice Message Route
// Mounted at: /api/ai/voice (or similar, depending on index.js)
// But User wanted: POST /api/ai/conversations/:id/voice
// So we will likely import this in index.js and mount appropriately.
// Or we define full path here?
// Let's define the relative path.

router.post("/conversations/:id/voice",
    authMiddleware,
    upload.single("audio"),
    sendVoiceMessage
);

export default router;
