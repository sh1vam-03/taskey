/**
 * AI Controller (Multi-Provider, Tiered Billing)
 *
 * Chat billing:  handled inside aiOrchestrator.service.js (token-based)
 * Voice billing: per-minute via calcVoiceCost (STT + TTS separate)
 *
 * ── Provider Selection ────────────────────────────────────────
 *   GET  /api/ai/settings   → current provider, speaker, STT language
 *   PATCH /api/ai/settings  → update provider / speaker / STT language
 *
 * ── TTS Language (AUTO-DETECTED) ─────────────────────────────
 * Bulbul v3 TTS language is detected from LLM output text automatically.
 * Users cannot set TTS language — they only choose their speaker voice.
 * Detection runs inside voice/tts.service.js via voice/languageDetect.js.
 *
 * ── STT Language (aiSarvamLang) ──────────────────────────────
 * Used only for Saaras v3 input transcription accuracy.
 * "unknown" = Saaras auto-detects the spoken language.
 */

import prisma from "../../config/db.js";
import asyncHandler from "../../utils/asyncHandler.js";
import fs from "fs";
import ApiError from "../../utils/ApiError.js";
import { processAiRequest, processAiRequestStream } from "../services/aiOrchestrator.service.js";
import { transcribeAudio, getSTTModelName } from "../voice/stt.service.js";
import {
    speakText,
    getAudioMimeType,
    getTTSModelName,
    BULBUL_SPEAKERS,
    DEFAULT_SPEAKER,
} from "../voice/tts.service.js";
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost,
} from "../services/aiToken.service.js";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

/** Valid STT input language codes. User sets this for better Saaras v3 accuracy. */
const VALID_STT_LANGS = [
    "unknown",
    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "gu-IN", "bn-IN", "pa-IN", "od-IN",
];

/** Speaker display metadata used by getAiSettings response. */
const SPEAKER_META = {
    shubh: { gender: "M", label: "Shubh" },
    amit: { gender: "M", label: "Amit" },
    sumit: { gender: "M", label: "Sumit" },
    manan: { gender: "M", label: "Manan" },
    rahul: { gender: "M", label: "Rahul" },
    ratan: { gender: "M", label: "Ratan" },
    ritu: { gender: "F", label: "Ritu" },
    pooja: { gender: "F", label: "Pooja" },
    simran: { gender: "F", label: "Simran" },
    kavya: { gender: "F", label: "Kavya" },
    priya: { gender: "F", label: "Priya" },
    ishita: { gender: "F", label: "Ishita" },
    shreya: { gender: "F", label: "Shreya" },
    shruti: { gender: "F", label: "Shruti" },
};

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

/** Safely unlink a file — logs a warning on failure but never throws. */
const safeUnlink = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
            console.warn(`[AI Controller] Failed to delete temp file ${filePath}:`, e.message);
        }
    }
};

// ─────────────────────────────────────────────────────────────
// AI SETTINGS — Read & Update
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/ai/settings
 *
 * Returns the user's current AI configuration.
 * Includes static option lists so the frontend doesn't need to hard-code them.
 *
 * Key distinctions:
 *   sttLang  → User-set. Helps Saaras accurately transcribe spoken input.
 *   speaker  → User-set. The Bulbul v3 voice the user hears.
 *   TTS lang → Never user-set. Auto-detected per-response from LLM output text.
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

    const availableSpeakers = BULBUL_SPEAKERS.map((id) => ({
        id,
        label: SPEAKER_META[id]?.label || id,
        gender: SPEAKER_META[id]?.gender || "?",
    }));

    res.status(200).json({
        success: true,
        data: {
            // Current values
            provider: user.aiProvider,
            sttLang: user.aiSarvamLang,    // STT input language hint (Saaras v3)
            speaker: user.aiSarvamSpeaker,  // TTS voice (Bulbul v3)
            creditBalance: user.aiCreditBalance,
            plan: user.plan,

            // TTS language is always automatic
            ttsLanguageMode: "auto",
            ttsLanguageNote: "TTS language is automatically detected from the AI response text. It cannot be manually set.",

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
                    description: "Optimised for Indian languages — Hindi, Marathi, Tamil and more. No tool calling.",
                    supportsTools: false,
                    supportsVoice: true,
                },
            ],

            // STT language options — user sets this for better transcription accuracy
            availableSttLangs: [
                { code: "unknown", label: "Auto-detect (default)" },
                { code: "en-IN", label: "English" },
                { code: "hi-IN", label: "Hindi" },
                { code: "mr-IN", label: "Marathi" },
                { code: "ta-IN", label: "Tamil" },
                { code: "te-IN", label: "Telugu" },
                { code: "kn-IN", label: "Kannada" },
                { code: "ml-IN", label: "Malayalam" },
                { code: "gu-IN", label: "Gujarati" },
                { code: "bn-IN", label: "Bengali" },
                { code: "pa-IN", label: "Punjabi" },
                { code: "od-IN", label: "Odia" },
            ],

            // Speaker options — user picks the voice they hear
            availableSpeakers,
        },
    });
});

/**
 * PATCH /api/ai/settings
 *
 * Updates the user's AI provider preferences.
 * All body fields are optional — send only what's changing.
 *
 * Body:
 *   provider : "openai" | "sarvam"
 *   sttLang  : BCP-47 e.g. "hi-IN" | "unknown"   (Saaras STT accuracy hint)
 *   speaker  : Bulbul v3 voice name e.g. "priya"  (user-chosen TTS voice)
 *
 * There is intentionally NO ttsLang field — TTS language is always auto-detected.
 */
export const updateAiSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { provider, sttLang, speaker } = req.body;

    const updates = {};

    if (provider !== undefined) {
        if (!["openai", "sarvam"].includes(provider)) {
            throw new ApiError(400, `Invalid provider "${provider}". Must be "openai" or "sarvam".`);
        }
        updates.aiProvider = provider;
    }

    if (sttLang !== undefined) {
        if (!VALID_STT_LANGS.includes(sttLang)) {
            throw new ApiError(
                400,
                `Invalid STT language "${sttLang}". Supported: ${VALID_STT_LANGS.join(", ")}`
            );
        }
        updates.aiSarvamLang = sttLang;
    }

    if (speaker !== undefined) {
        if (!BULBUL_SPEAKERS.includes(speaker)) {
            throw new ApiError(
                400,
                `Invalid speaker "${speaker}". Supported: ${BULBUL_SPEAKERS.join(", ")}`
            );
        }
        updates.aiSarvamSpeaker = speaker;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "No valid fields provided. Send at least one of: provider, sttLang, speaker"
        );
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
            sttLang: user.aiSarvamLang,
            speaker: user.aiSarvamSpeaker,
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
            console.error("[Controller] Streaming error:", error);
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
// VOICE — Full Voice-to-Voice Pipeline
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:id/voice
 *
 * Full pipeline: Audio → STT → LLM → TTS (auto-lang) → Audio response
 *
 * Billing:
 *   STT: calcVoiceCost(sttModel, actualAudioDuration)
 *   LLM: token-based inside processAiRequest
 *   TTS: calcVoiceCost(ttsModel, actualTTSDuration)
 *
 * Language handling:
 *   STT: user.aiSarvamLang ("unknown" = Saaras auto-detect)
 *   TTS: auto-detected from LLM response text by languageDetect.js
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

    let ttsAudioPath = null;

    try {
        // ── 1. STT ─────────────────────────────────────────────
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

        safeUnlink(req.file.path);

        if (!userText?.trim()) throw new ApiError(400, "Could not understand audio");

        // ── 2. LLM (billing handled inside orchestrator) ───────
        const aiMessage = await processAiRequest({
            userId,
            conversationId: id,
            message: userText,
            mode: "VOICE",
        });

        // ── 3. TTS — language auto-detected from text ──────────
        const { inferVoiceEmotion } = await import("../voice/voice.emotion.js");
        const emotion = inferVoiceEmotion({ summary: aiMessage.content });

        const { audioPath, durationMinutes: ttsDuration, detectedLang } = await speakText({
            text: aiMessage.content,
            emotion,
            provider,
            speaker: user.aiSarvamSpeaker || DEFAULT_SPEAKER,
        });

        ttsAudioPath = audioPath; // track for cleanup on error

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes: ttsDuration, detectedLang },
        });

        // ── 4. Respond ─────────────────────────────────────────
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(provider);
        safeUnlink(audioPath);
        ttsAudioPath = null; // cleared — file is gone

        res.status(200).json({
            success: true,
            data: {
                userText,
                reply: aiMessage.content,
                audioUrl: `data:${mimeType};base64,${audioBase64}`,
                provider,
                billing: {
                    stt: { model: sttModel, credits: sttCredits, durationMinutes: sttDuration },
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration, detectedLang },
                },
            },
        });
    } catch (error) {
        // Clean up any temp files left behind
        safeUnlink(req.file?.path);
        safeUnlink(ttsAudioPath);
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

        safeUnlink(req.file.path);

        res.status(200).json({
            success: true,
            data: { text, provider, model: sttModel, billing: { credits, durationMinutes } },
        });
    } catch (error) {
        safeUnlink(req.file?.path);
        throw error;
    }
});

// ─────────────────────────────────────────────────────────────
// VOICE — TTS Only
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/ai/voice/tts
 *
 * Body:
 *   text    : string  (required) — text to synthesize
 *   speaker : string  (optional) — override user's default speaker
 *
 * NOTE: languageCode is intentionally NOT accepted.
 * TTS language is always auto-detected from text content.
 */
export const synthesizeVoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { text, speaker } = req.body;

    if (!text) throw new ApiError(400, "Text is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const ttsModel = getTTSModelName(provider);

    await checkCreditBalance(userId, calcVoiceCost(ttsModel, 1));

    let audioPath = null;

    try {
        const result = await speakText({
            text,
            provider,
            speaker: speaker || user.aiSarvamSpeaker || DEFAULT_SPEAKER,
        });

        audioPath = result.audioPath;
        const { durationMinutes, detectedLang } = result;

        const credits = calcVoiceCost(ttsModel, durationMinutes);
        await deductCredits({
            userId,
            conversationId: null,
            credits,
            model: ttsModel,
            type: "VOICE",
            provider,
            meta: { durationMinutes, detectedLang },
        });

        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(provider);
        safeUnlink(audioPath);
        audioPath = null;

        res.status(200).json({
            success: true,
            data: {
                audioUrl: `data:${mimeType};base64,${audioBase64}`,
                provider,
                model: ttsModel,
                detectedLang,
                billing: { credits, durationMinutes },
            },
        });
    } catch (error) {
        safeUnlink(audioPath); // clean up if deductCredits or read failed
        throw error;
    }
});