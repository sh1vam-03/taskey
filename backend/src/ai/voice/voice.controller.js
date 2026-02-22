/**
 * Voice Controller
 * Handles standalone voice processing.
 *
 * Note: The full voice pipeline (Audio → STT → LLM → TTS) lives in
 * ai.controller.js (processVoiceMessage) registered on ai.routes.js.
 *
 * This controller is retained for future use — e.g. if you want to mount
 * voice endpoints on a separate router or add voice-only features here.
 * Currently all active voice routes are in ai.routes.js.
 */

import asyncHandler from "../../utils/asyncHandler.js";
import prisma from "../../config/db.js";
// ✅ FIX: Removed unused imports HumanMessage, AIMessage — not needed in this controller
import { transcribeAudio, getSTTModelName } from "./stt.service.js";
import { speakText, getAudioMimeType, getTTSModelName } from "./tts.service.js";
import { inferVoiceEmotion } from "./voice.emotion.js";
import { validateInputSafety } from "../validators/safety.validator.js";
import { processAiRequest } from "../services/aiOrchestrator.service.js";
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost,
} from "../services/aiToken.service.js";
import fs from "fs";

const getUserProvider = (user) => {
    const p = user?.aiProvider;
    return p === "sarvam" || p === "openai" ? p : "openai";
};

/**
 * Full voice pipeline: Audio → STT → LLM → TTS → Audio response.
 * This handler can be mounted on any route that supplies a file upload
 * and a conversation :id param.
 *
 * Billing:
 *   STT: per-minute via calcVoiceCost
 *   LLM: token-based inside processAiRequest
 *   TTS: per-minute via calcVoiceCost
 */
export const sendVoiceMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    const user = await prisma.user.findUnique({ where: { id: reqUser.id } });
    const provider = getUserProvider(user);
    const sttModel = getSTTModelName(provider);
    const ttsModel = getTTSModelName(provider);

    // Conservative pre-check
    const sttMax = calcVoiceCost(sttModel, 1);
    const llmMax = estimateMaxChatCost(provider === "sarvam" ? "sarvam-m" : "gpt-4o-mini");
    const ttsMax = calcVoiceCost(ttsModel, 1);
    await checkCreditBalance(user.id, sttMax + llmMax + ttsMax);

    if (!req.file) throw new Error("Audio file is required");

    try {
        // 1. STT
        const { text: inputText, durationMinutes: sttDuration } = await transcribeAudio(
            req.file.path,
            provider,
            { languageCode: user.aiSarvamLang || "unknown" }
        );

        if (!validateInputSafety(inputText)) {
            throw new Error("Unsafe content detected in audio transcription.");
        }

        const sttCredits = calcVoiceCost(sttModel, sttDuration);
        await deductCredits({
            userId: user.id,
            conversationId: id,
            credits: sttCredits,
            model: sttModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: sttDuration },
        });

        // 2. LLM (billing inside orchestrator)
        const savedAiMsg = await processAiRequest({
            userId: user.id,
            conversationId: id,
            message: inputText,
            mode: "VOICE",
        });

        const aiContentString = savedAiMsg.content;

        // 3. TTS
        const emotion = inferVoiceEmotion({ summary: aiContentString });
        const { audioPath, durationMinutes: ttsDuration } = await speakText({
            text: aiContentString,
            emotion,
            provider,
            languageCode: user.aiSarvamLang || "en-IN",
            speaker: user.aiSarvamSpeaker || "meera",
        });

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId: user.id,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: ttsDuration },
        });

        // 4. Clean up uploaded file
        try { fs.unlinkSync(req.file.path); } catch (e) {
            console.warn("[VoiceController] Failed to delete input file:", e.message);
        }

        // 5. Return audio response
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(provider);
        const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;

        try { fs.unlinkSync(audioPath); } catch (e) {
            console.warn("[VoiceController] Failed to delete output file:", e.message);
        }

        res.json({
            success: true,
            data: {
                message: savedAiMsg,
                audioUrl: audioDataUrl,
                inputText,
                emotion,
                provider,
                billing: {
                    stt: { model: sttModel, credits: sttCredits, durationMinutes: sttDuration },
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration },
                },
            },
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch { }
        }
        throw error;
    }
});