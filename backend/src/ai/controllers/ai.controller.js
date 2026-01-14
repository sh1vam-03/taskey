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
