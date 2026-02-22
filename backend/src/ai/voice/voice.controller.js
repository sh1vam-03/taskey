/**
 * Voice Controller
 * Standalone voice pipeline handler.
 *
 * All active voice routes are registered in ai.routes.js.
 * This controller is retained as a shared implementation that can be
 * mounted on additional routers if needed.
 *
 * Model resolution (all from user record):
 *   STT: user.aiSttModel      ("saaras:v3" | "whisper-1")
 *   LLM: user.aiVoiceModel    ("gemini-2.0-flash" | "sarvam-30b" | "gpt-4o-mini")
 *   TTS: user.aiTtsModel      ("bulbul:v3" | "tts-1")
 *
 * STT language: user.aiSarvamLang    (input language hint for Saaras v3)
 * TTS speaker:  user.aiSarvamSpeaker (voice selection for Bulbul v3)
 * TTS language: AUTO-DETECTED from LLM output text (never user-set)
 *
 * FIX: Changed plain `throw new Error(...)` to `throw new ApiError(...)` so
 * errors return consistent JSON { success: false, message } responses instead
 * of unhandled 500s with HTML stack traces.
 */

import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/db.js";
import { transcribeAudio } from "./stt.service.js";
import {
    speakText,
    getAudioMimeType,
    DEFAULT_SPEAKER
} from "./tts.service.js";
import { inferVoiceEmotion } from "./voice.emotion.js";
import { validateInputSafety } from "../validators/safety.validator.js";
import { processAiRequest } from "../services/aiOrchestrator.service.js";
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost
} from "../services/aiToken.service.js";
import fs from "fs";

const VALID_STT_MODELS = ["saaras:v3", "whisper-1"];
const VALID_TTS_MODELS = ["bulbul:v3", "tts-1"];
const VALID_CHAT_MODELS = ["gemini-2.0-flash", "sarvam-30b", "gpt-4o-mini"];

const resolveSttModel = (user) => VALID_STT_MODELS.includes(user?.aiSttModel) ? user.aiSttModel : "saaras:v3";
const resolveTtsModel = (user) => VALID_TTS_MODELS.includes(user?.aiTtsModel) ? user.aiTtsModel : "bulbul:v3";
const resolveVoiceModel = (user) => VALID_CHAT_MODELS.includes(user?.aiVoiceModel) ? user.aiVoiceModel : "gemini-2.0-flash";

/** Safely delete a temp file — warns on failure but never throws. */
const safeUnlink = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
            console.warn(`[VoiceController] Failed to delete temp file ${filePath}:`, e.message);
        }
    }
};

/**
 * Full voice pipeline: Audio → STT → LLM → TTS → Audio response.
 *
 * Billing:
 *   STT: per-minute (saaras:v3 or whisper-1)
 *   LLM: token-based inside processAiRequest (uses user.aiVoiceModel)
 *   TTS: per-minute (bulbul:v3 or tts-1)
 */
export const sendVoiceMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // FIX: Use ApiError (400) instead of plain Error for consistent JSON error responses
    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(404, "User not found");

    const sttModel = resolveSttModel(user);
    const ttsModel = resolveTtsModel(user);
    const voiceModel = resolveVoiceModel(user);

    // Conservative pre-check: 1 min STT + max LLM cost + 1 min TTS
    await checkCreditBalance(
        user.id,
        calcVoiceCost(sttModel, 1) + estimateMaxChatCost(voiceModel) + calcVoiceCost(ttsModel, 1)
    );

    let ttsAudioPath = null;

    try {
        // ── 1. STT ─────────────────────────────────────────────
        const { text: inputText, durationMinutes: sttDuration } = await transcribeAudio(
            req.file.path,
            sttModel,
            { languageCode: user.aiSarvamLang || "unknown" }
        );

        if (!validateInputSafety(inputText)) {
            safeUnlink(req.file.path);
            throw new ApiError(400, "Unsafe content detected in audio transcription.");
        }

        const sttCredits = calcVoiceCost(sttModel, sttDuration);
        await deductCredits({
            userId: user.id,
            conversationId: id,
            credits: sttCredits,
            model: sttModel,
            type: "VOICE",
            provider: sttModel,
            meta: { durationMinutes: sttDuration }
        });

        safeUnlink(req.file.path);

        if (!inputText?.trim()) {
            throw new ApiError(400, "Could not understand audio — transcript was empty.");
        }

        // ── 2. LLM (billing inside orchestrator, uses user.aiVoiceModel) ──
        const savedAiMsg = await processAiRequest({
            userId: user.id,
            conversationId: id,
            message: inputText,
            mode: "VOICE"
        });

        const aiContentString = savedAiMsg.content; // already normalized string from orchestrator

        // ── 3. TTS — language auto-detected from LLM output ────
        const emotion = inferVoiceEmotion({ summary: aiContentString });
        const { audioPath, durationMinutes: ttsDuration, detectedLang } = await speakText({
            text: aiContentString,
            emotion,
            ttsModel,
            speaker: user.aiSarvamSpeaker || DEFAULT_SPEAKER
        });

        ttsAudioPath = audioPath;

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId: user.id,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider: ttsModel,
            meta: { durationMinutes: ttsDuration, detectedLang }
        });

        // ── 4. Read TTS file and respond ───────────────────────
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(ttsModel);
        const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;

        safeUnlink(audioPath);
        ttsAudioPath = null;

        res.json({
            success: true,
            data: {
                message: savedAiMsg,
                audioUrl: audioDataUrl,
                inputText,
                emotion,
                models: { stt: sttModel, llm: voiceModel, tts: ttsModel },
                billing: {
                    stt: { model: sttModel, credits: sttCredits, durationMinutes: sttDuration },
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration, detectedLang }
                }
            }
        });
    } catch (error) {
        safeUnlink(req.file?.path);
        safeUnlink(ttsAudioPath);
        throw error;
    }
});