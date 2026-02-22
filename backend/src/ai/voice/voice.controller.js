/**
 * Voice Controller
 * Standalone voice pipeline handler.
 *
 * All active voice routes are registered in ai.routes.js.
 * This controller is retained as a shared implementation that can be
 * mounted on additional routers if needed.
 *
 * TTS Language: auto-detected from LLM output text (languageDetect.js).
 * TTS Speaker:  taken from user.aiSarvamSpeaker (user preference).
 * STT Language: taken from user.aiSarvamLang (user's spoken language hint).
 */

import asyncHandler from "../../utils/asyncHandler.js";
import prisma from "../../config/db.js";
import { transcribeAudio, getSTTModelName } from "./stt.service.js";
import { speakText, getAudioMimeType, getTTSModelName, DEFAULT_SPEAKER } from "./tts.service.js";
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
 *
 * Billing:
 *   STT: per-minute (Saaras v3 or Whisper-1)
 *   LLM: token-based inside processAiRequest
 *   TTS: per-minute (Bulbul v3 or tts-1)
 */
export const sendVoiceMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
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
        // 1. STT — uses user.aiSarvamLang as input language hint
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

        // 2. LLM (billing handled inside orchestrator)
        const savedAiMsg = await processAiRequest({
            userId: user.id,
            conversationId: id,
            message: inputText,
            mode: "VOICE",
        });

        const aiContentString = savedAiMsg.content;

        // 3. TTS — language is AUTO-DETECTED from aiContentString inside speakText
        const emotion = inferVoiceEmotion({ summary: aiContentString });
        const {
            audioPath,
            durationMinutes: ttsDuration,
            detectedLang,
        } = await speakText({
            text: aiContentString,
            emotion,
            provider,
            // NOTE: No languageCode passed — auto-detected from text by languageDetect.js
            speaker: user.aiSarvamSpeaker || DEFAULT_SPEAKER,
        });

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId: user.id,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: ttsDuration, detectedLang },
        });

        // 4. Cleanup input file
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
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration, detectedLang },
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