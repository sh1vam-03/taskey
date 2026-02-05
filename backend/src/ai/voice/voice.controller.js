import asyncHandler from "../../utils/asyncHandler.js";
import prisma from "../../config/db.js";
import { runAgentGraph } from "../graph/main.graph.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { transcribeAudio } from "./stt.service.js";
import { speakText } from "./tts.service.js";
import { inferVoiceEmotion } from "./voice.emotion.js";
import fs from 'fs';

/**
 * POST /api/ai/conversations/:id/voice
 * Send voice message and receive audio response + text persistence
 */
// Imports
import { validateInputSafety } from "../validators/safety.validator.js";
import { processAiRequest } from "../services/aiOrchestrator.service.js";
import { checkCreditBalance } from "../services/aiToken.service.js"; // Needed for pre-check only if transcription costs

// ...

export const sendVoiceMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    // 0. Strict Billing Pre-Check (Early fail)
    await checkCreditBalance(user.id);

    if (!req.file) throw new Error("Audio file is required");

    // 1. Transcribe Audio
    const inputText = await transcribeAudio(req.file.path);

    // 2. Process via Orchestrator (Safety + Agent + Saving + standard billing)
    const savedAiMsg = await processAiRequest({
        userId: user.id,
        conversationId: id,
        message: inputText,
        mode: "VOICE"
    });

    const aiContentString = savedAiMsg.content;

    // 3. Generate Audio Response (TTS)
    const emotionContext = { summary: aiContentString };
    const emotion = inferVoiceEmotion(emotionContext);
    const audioPathResult = await speakText({ text: aiContentString, emotion });

    // 4. Update Timestamp (Orchestrator did this, but maybe redundant updates are fine or we skip)
    // Orchestrator already updated lastMessageAt.

    // 5. Clean up Temp Audio
    try {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
    } catch (e) {
        console.warn("Failed to delete temp audio file:", e.message);
    }

    res.json({
        success: true,
        data: {
            message: savedAiMsg,
            audioPath: audioPathResult,
            inputText,
            emotion
        }
    });
});
