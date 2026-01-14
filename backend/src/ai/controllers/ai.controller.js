import asyncHandler from "../../utils/asyncHandler.js";
import { processAiRequest } from "../services/aiOrchestrator.service.js";

/**
 * POST /api/ai/text/execute
 * Main AI entry point (Text)
 */
export const executeAi = asyncHandler(async (req, res) => {
    const user = req.user;
    const { message } = req.body;

    const result = await processAiRequest({
        userId: user.id,
        message,
        mode: "TEXT",
    });

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * GET /api/ai/text/history
 * Fetch AI chat history
 */
export const getHistory = asyncHandler(async (req, res) => {
    const user = req.user;

    const history = await import("../../config/db.js").then((m) =>
        m.default.aiChatMessage.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        })
    );

    res.status(200).json({
        success: true,
        data: history,
    });
});
