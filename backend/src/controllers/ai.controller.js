import asyncHandler from "../utils/asyncHandler.js";
import { deductAiTokens } from "../services/aiToken.service.js";
import prisma from "../config/db.js";
import { AiUsageType } from "@prisma/client";

/**
 * POST /api/ai/chat
 */
export const chatWithAssistant = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: "Prompt required" });
    }

    // 🔢 Token estimation (cheap + safe)
    const estimatedTokens = Math.ceil(prompt.length / 4) + 50;

    // Check Balance
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { aiTokenBalance: true }
    });

    if (!user || user.aiTokenBalance < estimatedTokens) {
        return res.status(403).json({ message: "Insufficient AI tokens" });
    }

    // 🧠 Fetch Context (RAG)
    const [tasks, schedules] = await Promise.all([
        prisma.task.findMany({
            where: { userId, isArchived: false },
            select: { title: true, priority: true, dueDate: true, description: true },
            take: 20
        }),
        prisma.schedule.findMany({
            where: {
                userId,
                scheduleDate: new Date()
            },
            select: { startTime: true, endTime: true, notes: true },
            include: { task: { select: { title: true } } }
        })
    ]);

    const context = `
    User Context:
    - Today's Date: ${new Date().toDateString()}
    - Active Tasks: ${JSON.stringify(tasks)}
    - Today's Schedule: ${JSON.stringify(schedules)}
    
    Answer the user's question based on this context if relevant.
    `;

    // ⚠️ Call AI ONLY after precheck
    const fullPrompt = `${context}\n\nUser Question: ${prompt}`;
    const assistantReply = await aiService.generateResponse(fullPrompt);

    // 🔢 Final token count (real)
    const finalTokensUsed = estimatedTokens; // Simplified for now

    // ✅ Deduct (safe)
    await deductAiTokens({
        userId,
        tokensUsed: finalTokensUsed,
        type: AiUsageType.CHAT,
    });

    // Save chat
    await prisma.aiChatMessage.createMany({
        data: [
            {
                userId,
                role: "USER",
                content: prompt,
                tokensUsed: finalTokensUsed,
            },
            {
                userId,
                role: "ASSISTANT",
                content: assistantReply,
                tokensUsed: 0,
            },
        ],
    });

    res.json({
        success: true,
        data: {
            reply: assistantReply,
            tokensUsed: finalTokensUsed,
        },
    });
});


/**
 * POST /api/ai/voice
 */
export const voiceAssistant = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { durationSeconds } = req.body;

    if (!durationSeconds || durationSeconds <= 0) {
        return res.status(400).json({ message: "Invalid duration" });
    }

    // 🔢 Fixed rule
    const tokensUsed = durationSeconds * 5;

    await deductAiTokens({
        userId,
        tokensUsed,
        type: AiUsageType.VOICE,
    });

    await prisma.aiVoiceSession.create({
        data: {
            userId,
            transcribedText: "",
            assistantReply: "Voice response",
            durationSeconds,
            tokensUsed,
        },
    });

    res.json({
        success: true,
        data: {
            tokensUsed,
        },
    });
});
