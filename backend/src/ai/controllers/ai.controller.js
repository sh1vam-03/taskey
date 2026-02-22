/**
 * AI Controller (Multi-Provider, Tiered Billing)
 *
 * Chat billing is handled entirely inside aiOrchestrator.service.js.
 * Voice billing uses per-minute calcVoiceCost from aiToken.service.js.
 *
 * Provider selection:
 *   GET  /api/ai/settings        → read current provider + language prefs
 *   PATCH /api/ai/settings       → switch provider / language / speaker
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
    estimateMaxChatCost,
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

// Valid Sarvam speaker voices
const VALID_SARVAM_SPEAKERS = [
    "meera", "priya", "arjun", "anushka", "maya", "kiran", "kavya",
];

// Valid BCP-47 language codes supported by Sarvam
const VALID_SARVAM_LANGS = [
    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "gu-IN", "bn-IN", "pa-IN", "unknown",
];

// ─────────────────────────────────────────────────────────────
// AI SETTINGS — Read & Update provider preferences
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/ai/settings
 * Returns the user's current AI provider preferences.
 * Frontend uses this to show the active model + language picker.
 */
export const getAiSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            aiProvider: true,
            aiSarvamLang: true,
            aiSarvamSpeaker: true,
            aiCreditBalance: true,
            plan: true,
        },
    });

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({
        success: true,
        data: {
            provider: user.aiProvider,           // "openai" | "sarvam"
            sarvamLang: user.aiSarvamLang,        // BCP-47 code e.g. "hi-IN"
            sarvamSpeaker: user.aiSarvamSpeaker,  // voice name e.g. "meera"
            creditBalance: user.aiCreditBalance,
            plan: user.plan,
            // Tell the frontend which providers are available
            availableProviders: [
                {
                    id: "openai",
                    name: "OpenAI (GPT-4o mini)",
                    description: "Full agentic mode — tasks, schedules, web search, tool calling",
                    supportsTools: true,
                    supportsVoice: true,
                },
                {
                    id: "sarvam",
                    name: "Sarvam AI (sarvam-m)",
                    description: "Optimised for Indian languages — Hindi, Marathi, Tamil and more",
                    supportsTools: false,
                    supportsVoice: true,
                },
            ],
            availableSarvamLangs: [
                { code: "en-IN", label: "English (India)" },
                { code: "hi-IN", label: "Hindi" },
                { code: "mr-IN", label: "Marathi" },
                { code: "ta-IN", label: "Tamil" },
                { code: "te-IN", label: "Telugu" },
                { code: "kn-IN", label: "Kannada" },
                { code: "ml-IN", label: "Malayalam" },
                { code: "gu-IN", label: "Gujarati" },
                { code: "bn-IN", label: "Bengali" },
                { code: "pa-IN", label: "Punjabi" },
            ],
            availableSarvamSpeakers: [
                { id: "meera", label: "Meera (F)" },
                { id: "priya", label: "Priya (F)" },
                { id: "anushka", label: "Anushka (F)" },
                { id: "arjun", label: "Arjun (M)" },
                { id: "kiran", label: "Kiran (M)" },
                { id: "maya", label: "Maya (F)" },
                { id: "kavya", label: "Kavya (F)" },
            ],
        },
    });
});

/**
 * PATCH /api/ai/settings
 * Updates the user's AI provider preferences.
 *
 * Body (all fields optional — send only what's changing):
 *   provider     : "openai" | "sarvam"
 *   sarvamLang   : BCP-47 e.g. "hi-IN"
 *   sarvamSpeaker: voice name e.g. "meera"
 */
export const updateAiSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { provider, sarvamLang, sarvamSpeaker } = req.body;

    const updates = {};

    if (provider !== undefined) {
        if (!["openai", "sarvam"].includes(provider)) {
            throw new ApiError(400, `Invalid provider "${provider}". Must be "openai" or "sarvam".`);
        }
        updates.aiProvider = provider;
    }

    if (sarvamLang !== undefined) {
        if (!VALID_SARVAM_LANGS.includes(sarvamLang)) {
            throw new ApiError(400, `Invalid language code "${sarvamLang}". Supported: ${VALID_SARVAM_LANGS.join(", ")}`);
        }
        updates.aiSarvamLang = sarvamLang;
    }

    if (sarvamSpeaker !== undefined) {
        if (!VALID_SARVAM_SPEAKERS.includes(sarvamSpeaker)) {
            throw new ApiError(400, `Invalid speaker "${sarvamSpeaker}". Supported: ${VALID_SARVAM_SPEAKERS.join(", ")}`);
        }
        updates.aiSarvamSpeaker = sarvamSpeaker;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided. Send at least one of: provider, sarvamLang, sarvamSpeaker");
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
            aiProvider: true,
            aiSarvamLang: true,
            aiSarvamSpeaker: true,
        },
    });

    res.status(200).json({
        success: true,
        message: "AI settings updated successfully",
        data: {
            provider: user.aiProvider,
            sarvamLang: user.aiSarvamLang,
            sarvamSpeaker: user.aiSarvamSpeaker,
        },
    });
});

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