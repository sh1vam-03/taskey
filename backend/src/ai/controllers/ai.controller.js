/**
 * AI Controller (Multi-Provider, Tiered Billing)
 *
 * Chat billing is handled entirely inside aiOrchestrator.service.js.
 * Voice billing uses per-minute calcVoiceCost from aiToken.service.js.
 */

import prisma from "../../config/db.js";
import asyncHandler from "../../utils/asyncHandler.js";
import fs from "fs";
import ApiError from "../../utils/ApiError.js";
import { processAiRequest, processAiRequestStream } from "../services/aiOrchestrator.service.js";
import { transcribeAudio, getSTTModelName } from "../voice/stt.service.js";
import { speakText, getAudioMimeType, getTTSModelName } from "../voice/tts.service.js";
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost, // ✅ calcChatCost removed — chat billing is inside orchestrator (was unused here)
} from "../services/aiToken.service.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const formatMessage = (msg) => ({
    id: msg.id,
    role: msg.role === "USER" ? "user" : "assistant",
    content: msg.content,
    createdAt: msg.createdAt,
});

const getUserProvider = (user) => {
    const p = user?.aiProvider;
    return p === "sarvam" || p === "openai" ? p : "openai";
};

// ─────────────────────────────────────────────────────────────
// CONVERSATION CRUD
// ─────────────────────────────────────────────────────────────

export const createConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    const conversation = await prisma.aiConversation.create({ data: { userId } });
    let aiMessage = null;

    if (message) {
        aiMessage = await processAiRequest({
            userId,
            conversationId: conversation.id,
            message,
            mode: "TEXT",
        });
    }

    res.status(201).json({
        success: true,
        data: {
            conversation,
            message: aiMessage ? formatMessage(aiMessage) : null,
        },
    });
});

export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const conversations = await prisma.aiConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 50,
    });
    res.status(200).json({ success: true, data: conversations });
});

export const getConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const conversation = await prisma.aiConversation.findUnique({ where: { id, userId } });
    if (!conversation) throw new ApiError(404, "Conversation not found");
    res.status(200).json({ success: true, data: conversation });
});

export const updateConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;
    const conversation = await prisma.aiConversation.update({
        where: { id, userId },
        data: { title },
    });
    res.status(200).json({ success: true, data: conversation });
});

export const deleteConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await prisma.aiConversation.delete({ where: { id, userId } });
    res.status(200).json({ success: true, message: "Conversation deleted" });
});

export const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const conversation = await prisma.aiConversation.findUnique({ where: { id, userId } });
    if (!conversation) throw new ApiError(404, "Conversation not found");
    const messages = await prisma.aiMessage.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "asc" },
    });
    res.status(200).json({ success: true, data: messages.map(formatMessage) });
});

// ─────────────────────────────────────────────────────────────
// TEXT MESSAGE
// ─────────────────────────────────────────────────────────────

export const sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { message, stream } = req.body;

    if (!message) throw new ApiError(400, "Message is required");

    if (stream || req.query.stream === "true") {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        try {
            for await (const chunk of processAiRequestStream({
                userId,
                conversationId: id,
                message,
                mode: "TEXT",
            })) {
                res.write(chunk);
            }
            res.end();
        } catch (error) {
            console.error("Streaming Error:", error);
            res.write(`\n[ERROR: ${error.message}]`);
            res.end();
        }
        return;
    }

    const aiMessage = await processAiRequest({
        userId,
        conversationId: id,
        message,
        mode: "TEXT",
    });

    res.status(200).json({ success: true, data: formatMessage(aiMessage) });
});

// ─────────────────────────────────────────────────────────────
// VOICE — Full Voice-to-Voice
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:id/voice
 * Audio → STT → LLM → TTS → Audio
 *
 * Billing:
 *   STT: calcVoiceCost(sttModel, actualAudioDuration)
 *   LLM: handled inside processAiRequest (token-based, auto)
 *   TTS: calcVoiceCost(ttsModel, estimatedSpeakingDuration)
 */
export const processVoiceMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const sttModel = getSTTModelName(provider);
    const ttsModel = getTTSModelName(provider);

    // Conservative pre-check: assume 1 min STT + max LLM + 1 min TTS
    const sttMax = calcVoiceCost(sttModel, 1);
    const llmMax = estimateMaxChatCost(provider === "sarvam" ? "sarvam-m" : "gpt-4o-mini");
    const ttsMax = calcVoiceCost(ttsModel, 1);
    await checkCreditBalance(userId, sttMax + llmMax + ttsMax);

    try {
        // 1. STT
        const { text: userText, durationMinutes: sttDuration } = await transcribeAudio(
            req.file.path,
            provider,
            { languageCode: user.aiSarvamLang || "unknown" }
        );

        const sttCredits = calcVoiceCost(sttModel, sttDuration);
        await deductCredits({
            userId,
            conversationId: id,
            credits: sttCredits,
            model: sttModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: sttDuration },
        });

        fs.unlinkSync(req.file.path);

        if (!userText?.trim()) throw new ApiError(400, "Could not understand audio");

        // 2. LLM (billing inside orchestrator)
        const aiMessage = await processAiRequest({
            userId,
            conversationId: id,
            message: userText,
            mode: "VOICE",
        });

        // 3. TTS
        // ✅ FIX: was import("./voice.emotion.js") — controller is in controllers/, file is in voice/
        const { inferVoiceEmotion } = await import("../voice/voice.emotion.js");
        const emotion = inferVoiceEmotion({ summary: aiMessage.content });

        const { audioPath, durationMinutes: ttsDuration } = await speakText({
            text: aiMessage.content,
            emotion,
            provider,
            languageCode: user.aiSarvamLang || "en-IN",
            speaker: user.aiSarvamSpeaker || "meera",
        });

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: ttsDuration },
        });

        // 4. Respond
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(provider);
        const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;
        fs.unlinkSync(audioPath);

        res.status(200).json({
            success: true,
            data: {
                userText,
                reply: aiMessage.content,
                audioUrl: audioDataUrl,
                provider,
                billing: {
                    stt: { model: sttModel, credits: sttCredits, durationMinutes: sttDuration },
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration },
                },
            },
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw error;
    }
});

// ─────────────────────────────────────────────────────────────
// VOICE — STT Only
// ─────────────────────────────────────────────────────────────

export const transcribeVoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const sttModel = getSTTModelName(provider);

    await checkCreditBalance(userId, calcVoiceCost(sttModel, 1));

    try {
        const { text, durationMinutes } = await transcribeAudio(req.file.path, provider, {
            languageCode: user.aiSarvamLang || "unknown",
        });

        const credits = calcVoiceCost(sttModel, durationMinutes);
        await deductCredits({
            userId,
            conversationId: null,
            credits,
            model: sttModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes },
        });

        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: { text, provider, model: sttModel, billing: { credits, durationMinutes } },
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw error;
    }
});

// ─────────────────────────────────────────────────────────────
// VOICE — TTS Only
// ─────────────────────────────────────────────────────────────

export const synthesizeVoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { text, languageCode, speaker } = req.body;
    if (!text) throw new ApiError(400, "Text is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const ttsModel = getTTSModelName(provider);

    await checkCreditBalance(userId, calcVoiceCost(ttsModel, 1));

    const { audioPath, durationMinutes } = await speakText({
        text,
        provider,
        languageCode: languageCode || user.aiSarvamLang || "en-IN",
        speaker: speaker || user.aiSarvamSpeaker || "meera",
    });

    const credits = calcVoiceCost(ttsModel, durationMinutes);
    await deductCredits({
        userId,
        conversationId: null,
        credits,
        model: ttsModel,
        type: "VOICE",
        provider,
        meta: { durationMinutes },
    });

    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString("base64");
    const mimeType = getAudioMimeType(provider);
    const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;
    fs.unlinkSync(audioPath);

    res.status(200).json({
        success: true,
        data: { audioUrl: audioDataUrl, provider, model: ttsModel, billing: { credits, durationMinutes } },
    });
});
