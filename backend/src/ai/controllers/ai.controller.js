import prisma from "../../config/db.js";
import asyncHandler from "../../utils/asyncHandler.js";
import fs from "fs";
import ApiError from "../../utils/ApiError.js";
import { processAiRequest } from "../services/aiOrchestrator.service.js";
import { transcribeAudio } from "../voice/stt.service.js";
import { speakText } from "../voice/tts.service.js";

// Helper to format messages
const formatMessage = (msg) => ({
    id: msg.id,
    role: msg.role === "USER" ? "user" : "assistant",
    content: msg.content,
    createdAt: msg.createdAt
});

/**
 * POST /api/ai/conversations
 */
export const createConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    // Create Conversation
    const conversation = await prisma.aiConversation.create({
        data: { userId }
    });

    let aiMessage = null;

    // If initial message provided, process it
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

/**
 * GET /api/ai/conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const conversations = await prisma.aiConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 50
    });

    res.status(200).json({
        success: true,
        data: conversations
    });
});

/**
 * GET /api/ai/conversations/:id
 */
export const getConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await prisma.aiConversation.findUnique({
        where: { id, userId }
    });

    if (!conversation) throw new ApiError(404, "Conversation not found");

    res.status(200).json({
        success: true,
        data: conversation
    });
});

/**
 * PUT /api/ai/conversations/:id
 */
export const updateConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;

    const conversation = await prisma.aiConversation.update({
        where: { id, userId },
        data: { title }
    });

    res.status(200).json({
        success: true,
        data: conversation
    });
});

/**
 * DELETE /api/ai/conversations/:id
 */
export const deleteConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.aiConversation.delete({
        where: { id, userId }
    });

    res.status(200).json({
        success: true,
        message: "Conversation deleted"
    });
});

/**
 * GET /api/ai/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const conversation = await prisma.aiConversation.findUnique({
        where: { id, userId }
    });
    if (!conversation) throw new ApiError(404, "Conversation not found");

    const messages = await prisma.aiMessage.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
        success: true,
        data: messages.map(formatMessage)
    });
});

/**
 * POST /api/ai/conversations/:id/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { message, stream } = req.body; // Can accept stream flag in body too

    if (!message) throw new ApiError(400, "Message is required");

    // STREAMING HANDLER
    if (stream || req.query.stream === 'true') {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // For Nginx if used

        try {
            // Import dynamically to avoid circular deps with service if needed, 
            // but standard import is fine if handled correctly.
            const { processAiRequestStream } = await import("../services/aiOrchestrator.service.js");

            for await (const chunk of processAiRequestStream({
                userId,
                conversationId: id,
                message,
                mode: "TEXT"
            })) {
                // SSE format: data: <chunk>\n\n
                // But efficient streaming often just sends raw text chunks if client reads stream directly.
                // Standard SSE needs 'data: '. 
                // Let's use simple chunked transfer (raw text) which is easier for fetch() + getReader().
                // Just write the chunk.
                res.write(chunk);
            }
            res.end();
        } catch (error) {
            console.error("Streaming Error Controller:", error);
            // If headers sent, we can't send JSON error. 
            // Send a specific error chunk?
            res.write(`\n[ERROR: ${error.message}]`);
            res.end();
        }
        return;
    }

    // STANDARD HANDLER
    const aiMessage = await processAiRequest({
        userId,
        conversationId: id,
        message,
        mode: "TEXT"
    });

    res.status(200).json({
        success: true,
        data: formatMessage(aiMessage)
    });
});

/**
 * POST /api/ai/conversations/:id/voice
 * Handles Voice-to-Voice (Gemini Live style)
 */
export const processVoiceMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    if (!req.file) throw new ApiError(400, "Audio file is required");

    try {
        // 1. STT: Transcribe
        const userText = await transcribeAudio(req.file.path);

        // Cleanup input file immediately
        fs.unlinkSync(req.file.path);

        if (!userText || !userText.trim()) {
            throw new ApiError(400, "Could not understand audio");
        }

        // 2. AI: Process
        const aiMessage = await processAiRequest({
            userId,
            conversationId: id,
            message: userText,
            mode: "VOICE"
        });

        // 3. TTS: Synthesize
        const audioPath = await speakText({
            text: aiMessage.content
        });

        // 4. Return Audio (Base64)
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBase64 = audioBuffer.toString('base64');
        const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;

        // Cleanup output file
        fs.unlinkSync(audioPath);

        res.status(200).json({
            success: true,
            data: {
                userText,
                reply: aiMessage.content,
                audioUrl: audioDataUrl
            }
        });

    } catch (error) {
        // Cleanup if error occurred and file still exists
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw error;
    }
});

/**
 * POST /api/ai/voice/transcribe
 * Only converts Audio -> Text
 */
export const transcribeVoice = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Audio file is required");

    try {
        const text = await transcribeAudio(req.file.path);

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: { text }
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw error;
    }
});

/**
 * POST /api/ai/voice/tts
 * Only converts Text -> Audio
 */
export const synthesizeVoice = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) throw new ApiError(400, "Text is required");

    const audioPath = await speakText({ text });

    // Return as Base64 for easy frontend playback
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;

    // Cleanup
    fs.unlinkSync(audioPath);

    res.status(200).json({
        success: true,
        data: { audioUrl: audioDataUrl }
    });
});
