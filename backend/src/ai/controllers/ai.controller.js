/**
 * AI Controller (Multi-Model, Decoupled, Tiered Billing)
 *
 * Users independently choose FOUR things:
 *   aiChatModel  → LLM for text chat         (gemini-1.5-flash | sarvam-30b | gpt-4o-mini)
 *   aiVoiceModel → LLM for voice thinking    (same options)
 *   aiTtsModel   → Text-to-Speech model      (bulbul:v3 | tts-1)
 *   aiSttModel   → Speech-to-Text model      (saaras:v3 | whisper-1)
 *
 * Plus Sarvam-specific preferences:
 *   aiSarvamLang    → STT input language hint for Saaras v3 accuracy
 *   aiSarvamSpeaker → Bulbul v3 speaker voice
 *
 * Smart defaults (non-technical users can start immediately):
 *   Chat/Voice LLM → Gemini 1.5 Flash   (fast, cheap, multilingual)
 *   TTS            → Sarvam Bulbul v3   (Indian voices, auto-language)
 *   STT            → Sarvam Saaras v3   (best Indian accent accuracy)
 *
 * GET  /api/ai/settings  → returns current selections + full model catalog with pricing
 * PATCH /api/ai/settings → update any combination of the 6 fields
 *
 * ── TTS Language (AUTO-DETECTED) ──────────────────────────────
 * Bulbul v3 TTS language is detected from LLM output text automatically.
 * Users cannot set TTS language — they only choose their speaker voice.
 */

import prisma from "../../config/db.js";
import asyncHandler from "../../utils/asyncHandler.js";
import fs from "fs";
import ApiError from "../../utils/ApiError.js";
import { processAiRequest, processAiRequestStream } from "../services/aiOrchestrator.service.js";
import { transcribeAudio } from "../voice/stt.service.js";
import {
    speakText,
    getAudioMimeType,
    BULBUL_SPEAKERS,
    DEFAULT_SPEAKER
} from "../voice/tts.service.js";
import { inferVoiceEmotion } from "../voice/voice.emotion.js";  // ← static import (was dynamic)
import {
    checkCreditBalance,
    deductCredits,
    calcVoiceCost,
    estimateMaxChatCost
} from "../services/aiToken.service.js";
import {
    MODEL_INFO,
    VALID_CHAT_MODELS,
    VALID_TTS_MODELS,
    VALID_STT_MODELS
} from "../../config/plans.config.js";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const VALID_STT_LANGS = [
    "unknown",
    "en-IN", "hi-IN", "mr-IN", "ta-IN", "te-IN", "kn-IN",
    "ml-IN", "gu-IN", "bn-IN", "pa-IN", "od-IN"
];

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
    shruti: { gender: "F", label: "Shruti" }
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const formatMessage = (msg) => ({
    id: msg.id,
    role: msg.role === "USER" ? "user" : "assistant",
    content: msg.content,
    createdAt: msg.createdAt
});

const safeUnlink = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
            console.warn(`[AI Controller] Failed to delete temp file ${filePath}:`, e.message);
        }
    }
};

// ─────────────────────────────────────────────────────────────
// AI SETTINGS — Read
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/ai/settings
 *
 * Returns the user's current model selections PLUS the full catalog with
 * per-model pricing so the frontend can render a selection UI with costs.
 *
 * Response shape:
 * {
 *   // Current selections
 *   chatModel, voiceModel, ttsModel, sttModel, sttLang, speaker,
 *   creditBalance, plan,
 *
 *   // Model catalogs (with pricing) — frontend renders these as selection cards
 *   availableChatModels,   // 3 LLM options
 *   availableVoiceModels,  // same 3 LLM options (independent selection)
 *   availableTtsModels,    // 2 TTS options
 *   availableSttModels,    // 2 STT options
 *
 *   // Sarvam-specific option lists
 *   availableSttLangs,
 *   availableSpeakers,
 *
 *   ttsLanguageNote        // reminder that TTS language is automatic
 * }
 */
export const getAiSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            aiChatModel: true,
            aiVoiceModel: true,
            aiTtsModel: true,
            aiSttModel: true,
            aiSarvamLang: true,
            aiSarvamSpeaker: true,
            aiCreditBalance: true,
            plan: true
        }
    });

    if (!user) throw new ApiError(404, "User not found");

    const availableSpeakers = BULBUL_SPEAKERS.map(id => ({
        id,
        label: SPEAKER_META[id]?.label || id,
        gender: SPEAKER_META[id]?.gender || "?"
    }));

    res.status(200).json({
        success: true,
        data: {
            // ── Current user selections ──────────────────────────
            chatModel: user.aiChatModel || "gemini-1.5-flash",
            voiceModel: user.aiVoiceModel || "gemini-1.5-flash",
            ttsModel: user.aiTtsModel || "bulbul:v3",
            sttModel: user.aiSttModel || "saaras:v3",
            sttLang: user.aiSarvamLang || "unknown",
            speaker: user.aiSarvamSpeaker || "shubh",
            creditBalance: user.aiCreditBalance,
            plan: user.plan,

            // ── Model catalogs with pricing ──────────────────────
            // Frontend renders each array as selectable cards with price info.
            // Voice LLM uses the same options as chat LLM (independent selection).
            availableChatModels: MODEL_INFO.CHAT_MODELS,
            availableVoiceModels: MODEL_INFO.CHAT_MODELS,
            availableTtsModels: MODEL_INFO.TTS_MODELS,
            availableSttModels: MODEL_INFO.STT_MODELS,

            // ── Sarvam-specific STT language options ─────────────
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
                { code: "od-IN", label: "Odia" }
            ],

            // ── Bulbul v3 speaker voices ─────────────────────────
            availableSpeakers,

            // ── Info notes ───────────────────────────────────────
            ttsLanguageNote: "TTS language is automatically detected from AI response text. It cannot be manually set.",
            ttsLanguageMode: "auto"
        }
    });
});

// ─────────────────────────────────────────────────────────────
// AI SETTINGS — Update
// ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/ai/settings
 *
 * All body fields are optional — send only what's changing.
 * Any combination of fields can be updated in a single request.
 *
 * Body:
 *   chatModel  : "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini"
 *   voiceModel : same options as chatModel
 *   ttsModel   : "bulbul:v3" | "tts-1"
 *   sttModel   : "saaras:v3" | "whisper-1"
 *   sttLang    : BCP-47 e.g. "hi-IN" | "unknown"
 *   speaker    : Bulbul v3 voice name e.g. "priya"
 *
 * NOTE: There is intentionally NO ttsLang field.
 * TTS language is always auto-detected from text content.
 */
export const updateAiSettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { chatModel, voiceModel, ttsModel, sttModel, sttLang, speaker } = req.body;

    const updates = {};

    if (chatModel !== undefined) {
        if (!VALID_CHAT_MODELS.includes(chatModel))
            throw new ApiError(400, `Invalid chatModel "${chatModel}". Valid: ${VALID_CHAT_MODELS.join(", ")}`);
        updates.aiChatModel = chatModel;
    }

    if (voiceModel !== undefined) {
        if (!VALID_CHAT_MODELS.includes(voiceModel))
            throw new ApiError(400, `Invalid voiceModel "${voiceModel}". Valid: ${VALID_CHAT_MODELS.join(", ")}`);
        updates.aiVoiceModel = voiceModel;
    }

    if (ttsModel !== undefined) {
        if (!VALID_TTS_MODELS.includes(ttsModel))
            throw new ApiError(400, `Invalid ttsModel "${ttsModel}". Valid: ${VALID_TTS_MODELS.join(", ")}`);
        updates.aiTtsModel = ttsModel;
    }

    if (sttModel !== undefined) {
        if (!VALID_STT_MODELS.includes(sttModel))
            throw new ApiError(400, `Invalid sttModel "${sttModel}". Valid: ${VALID_STT_MODELS.join(", ")}`);
        updates.aiSttModel = sttModel;
    }

    if (sttLang !== undefined) {
        if (!VALID_STT_LANGS.includes(sttLang))
            throw new ApiError(400, `Invalid sttLang "${sttLang}". Supported: ${VALID_STT_LANGS.join(", ")}`);
        updates.aiSarvamLang = sttLang;
    }

    if (speaker !== undefined) {
        if (!BULBUL_SPEAKERS.includes(speaker))
            throw new ApiError(400, `Invalid speaker "${speaker}". Supported: ${BULBUL_SPEAKERS.join(", ")}`);
        updates.aiSarvamSpeaker = speaker;
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided. Send at least one of: chatModel, voiceModel, ttsModel, sttModel, sttLang, speaker");
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
            aiChatModel: true,
            aiVoiceModel: true,
            aiTtsModel: true,
            aiSttModel: true,
            aiSarvamLang: true,
            aiSarvamSpeaker: true
        }
    });

    res.status(200).json({
        success: true,
        message: "AI settings updated successfully",
        data: {
            chatModel: user.aiChatModel,
            voiceModel: user.aiVoiceModel,
            ttsModel: user.aiTtsModel,
            sttModel: user.aiSttModel,
            sttLang: user.aiSarvamLang,
            speaker: user.aiSarvamSpeaker
        }
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
            mode: "TEXT"
        });
    }

    res.status(201).json({
        success: true,
        data: {
            conversation,
            message: aiMessage ? formatMessage(aiMessage) : null
        }
    });
});

export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const conversations = await prisma.aiConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 50
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
        data: { title }
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
        orderBy: { createdAt: "asc" }
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
                mode: "TEXT"
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
        mode: "TEXT"
    });

    res.status(200).json({ success: true, data: formatMessage(aiMessage) });
});

// ─────────────────────────────────────────────────────────────
// VOICE — Full Pipeline (STT → LLM → TTS)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:id/voice
 *
 * Full pipeline: Audio → STT → LLM → TTS (auto-lang) → Audio response
 *
 * Uses user's 4 independent model selections:
 *   user.aiSttModel      → which model transcribes the audio
 *   user.aiVoiceModel    → which LLM generates the response (billing inside orchestrator)
 *   user.aiTtsModel      → which model speaks the response
 *   user.aiSarvamLang    → STT input language hint (for Saaras accuracy)
 *   user.aiSarvamSpeaker → TTS voice (for Bulbul v3)
 */
export const processVoiceMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Resolve models with safe fallbacks to defaults
    const sttModel = VALID_STT_MODELS.includes(user?.aiSttModel) ? user.aiSttModel : "saaras:v3";
    const ttsModel = VALID_TTS_MODELS.includes(user?.aiTtsModel) ? user.aiTtsModel : "bulbul:v3";
    const voiceModel = VALID_CHAT_MODELS.includes(user?.aiVoiceModel) ? user.aiVoiceModel : "gemini-1.5-flash";

    // Conservative pre-check: 1 min STT + max LLM cost + 1 min TTS
    await checkCreditBalance(
        userId,
        calcVoiceCost(sttModel, 1) + estimateMaxChatCost(voiceModel) + calcVoiceCost(ttsModel, 1)
    );

    let ttsAudioPath = null;

    try {
        // ── 1. STT ─────────────────────────────────────────────
        const { text: userText, durationMinutes: sttDuration } = await transcribeAudio(
            req.file.path,
            sttModel,
            { languageCode: user.aiSarvamLang || "unknown" }
        );

        const sttCredits = calcVoiceCost(sttModel, sttDuration);
        await deductCredits({
            userId,
            conversationId: id,
            credits: sttCredits,
            model: sttModel,
            type: "VOICE",
            provider: sttModel,
            meta: { durationMinutes: sttDuration }
        });

        safeUnlink(req.file.path);

        if (!userText?.trim()) throw new ApiError(400, "Could not understand audio");

        // ── 2. LLM (billing handled inside orchestrator) ───────
        const aiMessage = await processAiRequest({
            userId,
            conversationId: id,
            message: userText,
            mode: "VOICE"
        });

        // ── 3. TTS — language auto-detected from LLM output ────
        const emotion = inferVoiceEmotion({ summary: aiMessage.content });

        const { audioPath, durationMinutes: ttsDuration, detectedLang } = await speakText({
            text: aiMessage.content,
            emotion,
            ttsModel,
            speaker: user.aiSarvamSpeaker || DEFAULT_SPEAKER
        });

        ttsAudioPath = audioPath;

        const ttsCredits = calcVoiceCost(ttsModel, ttsDuration);
        await deductCredits({
            userId,
            conversationId: id,
            credits: ttsCredits,
            model: ttsModel,
            type: "VOICE",
            provider: ttsModel,
            meta: { durationMinutes: ttsDuration, detectedLang }
        });

        // ── 4. Respond ─────────────────────────────────────────
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(ttsModel);
        safeUnlink(audioPath);
        ttsAudioPath = null;

        res.status(200).json({
            success: true,
            data: {
                userText,
                reply: aiMessage.content,
                audioUrl: `data:${mimeType};base64,${audioBase64}`,
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

// ─────────────────────────────────────────────────────────────
// VOICE — STT Only
// ─────────────────────────────────────────────────────────────

export const transcribeVoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!req.file) throw new ApiError(400, "Audio file is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const sttModel = VALID_STT_MODELS.includes(user?.aiSttModel) ? user.aiSttModel : "saaras:v3";

    await checkCreditBalance(userId, calcVoiceCost(sttModel, 1));

    try {
        const { text, durationMinutes } = await transcribeAudio(
            req.file.path,
            sttModel,
            { languageCode: user.aiSarvamLang || "unknown" }
        );

        const credits = calcVoiceCost(sttModel, durationMinutes);
        await deductCredits({
            userId,
            conversationId: null,
            credits,
            model: sttModel,
            type: "VOICE",
            provider: sttModel,
            meta: { durationMinutes }
        });

        safeUnlink(req.file.path);

        res.status(200).json({
            success: true,
            data: { text, model: sttModel, billing: { credits, durationMinutes } }
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
 *   text    : string  (required)
 *   speaker : string  (optional, overrides user's default for this call only)
 *
 * NOTE: ttsLang is intentionally NOT accepted.
 * TTS language is always auto-detected from text content.
 */
export const synthesizeVoice = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { text, speaker } = req.body;

    if (!text) throw new ApiError(400, "Text is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ttsModel = VALID_TTS_MODELS.includes(user?.aiTtsModel) ? user.aiTtsModel : "bulbul:v3";

    await checkCreditBalance(userId, calcVoiceCost(ttsModel, 1));

    let audioPath = null;

    try {
        const result = await speakText({
            text,
            ttsModel,
            speaker: speaker || user.aiSarvamSpeaker || DEFAULT_SPEAKER
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
            provider: ttsModel,
            meta: { durationMinutes, detectedLang }
        });

        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString("base64");
        const mimeType = getAudioMimeType(ttsModel);
        safeUnlink(audioPath);
        audioPath = null;

        res.status(200).json({
            success: true,
            data: {
                audioUrl: `data:${mimeType};base64,${audioBase64}`,
                model: ttsModel,
                detectedLang,
                billing: { credits, durationMinutes }
            }
        });
    } catch (error) {
        safeUnlink(audioPath);
        throw error;
    }
});