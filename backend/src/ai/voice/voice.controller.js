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
import { countTokens, checkCreditBalance, deductCredits } from "../services/aiToken.service.js";

// ...

export const sendVoiceMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    // 0. Strict Billing Pre-Check
    await checkCreditBalance(user.id);

    if (!req.file) throw new Error("Audio file is required");

    // 1. Transcribe Audio
    const inputText = await transcribeAudio(req.file.path);

    // 1.1 Safety Check on Transcribed Text
    if (!validateInputSafety(inputText)) {
        res.status(400);
        throw new Error("Unsafe voice content detected. Request blocked.");
    }

    // 2. Verify Conversation Ownership
    const conversation = await prisma.aiConversation.findFirst({
        where: { id, userId: user.id }
    });
    if (!conversation) throw new Error("Conversation not found");

    // 3. Save User Message (Text from Audio)
    await prisma.aiMessage.create({
        data: {
            conversationId: id,
            userId: user.id,
            role: "USER",
            content: inputText,
            metadata: { type: "AUDIO", audioPath: req.file.path }
        }
    });

    // 4. Load History (for context)
    const history = await prisma.aiMessage.findMany({
        where: { conversationId: id, userId: user.id },
        orderBy: { createdAt: 'asc' },
        take: 20
    });

    const lcMessages = history.map(msg =>
        msg.role === 'USER' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    // 5. Run LangGraph Agent
    const aiResponse = await runAgentGraph({
        userId: user.id,
        messages: lcMessages,
        user,
        conversationId: id
    });

    const aiContent = aiResponse.content;
    const aiContentString = typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent);

    // 6. Save AI Response
    const savedAiMsg = await prisma.aiMessage.create({
        data: {
            conversationId: id,
            userId: user.id,
            role: "ASSISTANT",
            content: aiContentString
        }
    });

    // 7. Generate Audio Response (TTS)
    const emotionContext = { summary: aiContentString };
    const emotion = inferVoiceEmotion(emotionContext);
    const audioPathResult = await speakText({ text: aiContentString, emotion });

    // 8. Credit Deduction (Voice is expensive)
    const inputTokens = countTokens(inputText);
    const outputTokens = countTokens(aiContentString);
    const totalTokens = inputTokens + outputTokens;

    await deductCredits({
        userId: user.id,
        conversationId: id,
        credits: totalTokens * 1.5, // Voice premium multiplier
        model: "whisper-1 / tts-1",
        type: "VOICE"
    });

    // 9. Update Timestamp
    await prisma.aiConversation.update({
        where: { id },
        data: { lastMessageAt: new Date(), updatedAt: new Date() }
    });

    // 10. Clean up Temp Audio
    // Optional V1 Polish: Remove the uploaded file to save disk space
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
