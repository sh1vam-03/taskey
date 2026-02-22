/**
 * AI Controller (Multi-Provider, Tiered Billing)
 *
 * Chat billing:  handled inside aiOrchestrator.service.js
 * Voice billing: per-minute via calcVoiceCost in aiToken.service.js
 *
 * ── Provider Selection ────────────────────────────────────────
 *   GET  /api/ai/settings   → read current provider, speaker, STT language
 *   PATCH /api/ai/settings  → switch provider / speaker / STT language
 *
 * ── TTS Language Auto-Detection ──────────────────────────────
 * Bulbul v3 TTS language is AUTOMATICALLY DETECTED from the LLM output text.
 * Users cannot and do not need to select TTS language manually.
 * The detection lives in voice/languageDetect.js and runs inside tts.service.js.
 *
 * ── STT Language (aiSarvamLang) ──────────────────────────────
 * aiSarvamLang is used only for SPEECH-TO-TEXT (Saaras v3 input).
 * It helps Saaras accurately transcribe the user's spoken language.
 * "unknown" = auto-detect by Saaras (works well but slightly less accurate).
 */

import prisma from "../../config/db.js";
import asyncHandler from "../../utils/asyncHandler.js";
import fs from "fs";
import ApiError from "../../utils/ApiError.js";
import { processAiRequest, processAiRequestStream } from "../services/aiOrchestrator.service.js";
import { transcribeAudio, getSTTModelName } from "../voice/stt.service.js";
import { speakText, getAudioMimeType, getTTSModelName, BULBUL_SPEAKERS, DEFAULT_SPEAKER } from "../voice/tts.service.js";
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost,
} from "../services/aiToken.service.js";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

// Valid STT input languages (user sets this for better transcription accuracy)
const VALID_STT_LANGS = [
    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "gu-IN", "bn-IN", "pa-IN", "od-IN", "unknown",
];

// Speaker metadata for frontend display
const SPEAKER_META = {
    // Male
    shubh: { gender: "M", label: "Shubh" },
    amit: { gender: "M", label: "Amit" },
    sumit: { gender: "M", label: "Sumit" },
    manan: { gender: "M", label: "Manan" },
    rahul: { gender: "M", label: "Rahul" },
    ratan: { gender: "M", label: "Ratan" },
    // Female
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

// ─────────────────────────────────────────────────────────────
// AI SETTINGS — Read & Update
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/ai/settings
 *
 * Returns user's current AI provider config.
 * Key distinction:
 *   - sttLang:     User-configurable. Helps Saaras v3 transcribe speech accurately.
 *   - sarvamSpeaker: User-configurable. The Bulbul v3 voice they hear.
 *   - TTS Language: NOT user-configurable. Auto-detected from LLM output text.
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

    // Build speaker list with gender labels
    const availableSpeakers = BULBUL_SPEAKERS.map((id) => ({
        id,
        label: SPEAKER_META[id]?.label || id,
        gender: SPEAKER_META[id]?.gender || "?",
    }));

    res.status(200).json({
        success: true,
        data: {
            // Current settings
            provider: user.aiProvider,
            sttLang: user.aiSarvamLang,     // STT input language (Saaras v3)
            speaker: user.aiSarvamSpeaker,   // TTS speaker voice (Bulbul v3)

            creditBalance: user.aiCreditBalance,
            plan: user.plan,

            // Metadata for frontend UI
            ttsLanguageMode: "auto",  // Always auto-detected — display this to user
            ttsLanguageNote: "TTS language is automatically detected from the AI response text.",

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

            // STT language options (user sets this for better transcription)
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

            // Speaker options (user picks their preferred voice)
            availableSpeakers,
        },
    });
});

/**
 * PATCH /api/ai/settings
 *
 * Updates user's AI provider preferences.
 * Body (all optional — send only what's changing):
 *   provider  : "openai" | "sarvam"
 *   sttLang   : BCP-47 e.g. "hi-IN" | "unknown"  (for Saaras STT accuracy)
 *   speaker   : Bulbul v3 voice name e.g. "priya" (for TTS output voice)
 *
 * NOTE: There is no `ttsLang` field — TTS language is always auto-detected.
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
// VOICE — Full Voice-to-Voice Pipeline
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:id/voice
 * Audio → STT (Saaras v3) → LLM → TTS (Bulbul v3, auto-lang) → Audio
 *
 * Billing:
 *   STT: calcVoiceCost(sttModel, actualAudioDuration)
 *   LLM: token-based inside processAiRequest
 *   TTS: calcVoiceCost(ttsModel, actualAudioDuration)
 *
 * Language handling:
 *   STT: uses user.aiSarvamLang ("unknown" = auto-detect by Saaras)
 *   TTS: language is auto-detected from LLM text by languageDetect.js
 */
export const processVoiceMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const sttModel = getSTTModelName(provider);
    const ttsModel = getTTSModelName(provider);

    // Conservative pre-check: 1 min STT + max LLM + 1 min TTS
    const sttMax = calcVoiceCost(sttModel, 1);
    const llmMax = estimateMaxChatCost(provider === "sarvam" ? "sarvam-m" : "gpt-4o-mini");
    const ttsMax = calcVoiceCost(ttsModel, 1);
    await checkCreditBalance(userId, sttMax + llmMax + ttsMax);

    try {
        // ── 1. STT ─────────────────────────────────────────────
        // aiSarvamLang = user's spoken language hint for better STT accuracy
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

        // ── 2. LLM (billing inside orchestrator) ───────────────
        const aiMessage = await processAiRequest({
            userId,
            conversationId: id,
            message: userText,
            mode: "VOICE",
        });

        // ── 3. TTS — language is AUTO-DETECTED inside speakText ─
        const { inferVoiceEmotion } = await import("../voice/voice.emotion.js");
        const emotion = inferVoiceEmotion({ summary: aiMessage.content });

        const {
            audioPath,
            durationMinutes: ttsDuration,
            detectedLang,  // returned by speakText for logging
        } = await speakText({
            text: aiMessage.content,
            emotion,
            provider,
            // NOTE: NO languageCode passed here — auto-detected from text
            speaker: user.aiSarvamSpeaker || DEFAULT_SPEAKER,
        });

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
                    tts: { model: ttsModel, credits: ttsCredits, durationMinutes: ttsDuration, detectedLang },
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
    const { text, speaker } = req.body;
    // NOTE: `languageCode` is intentionally NOT accepted from the request body.
    // TTS language is always auto-detected from text content.
    if (!text) throw new ApiError(400, "Text is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const provider = getUserProvider(user);
    const ttsModel = getTTSModelName(provider);

    await checkCreditBalance(userId, calcVoiceCost(ttsModel, 1));

    const {
        audioPath,
        durationMinutes,
        detectedLang,
    } = await speakText({
        text,
        provider,
        // Language auto-detected from text
        speaker: speaker || user.aiSarvamSpeaker || DEFAULT_SPEAKER,
    });

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
    const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;
    fs.unlinkSync(audioPath);

    res.status(200).json({
        success: true,
        data: {
            audioUrl: audioDataUrl,
            provider,
            model: ttsModel,
            detectedLang,
            billing: { credits, durationMinutes },
        },
    });
});