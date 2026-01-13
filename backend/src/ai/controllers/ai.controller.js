import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

import { createAgent } from "../agent/agent.factory.js";
import { runIntentChain } from "../chains/intent.chain.js";
import { runPlannerChain } from "../chains/planner.chain.js";
import { runReflectionChain } from "../chains/reflection.chain.js";

import { validateSafety } from "../validators/safety.validator.js";
import { validateSchedule } from "../validators/schedule.validator.js";

import { executeAiPlan } from "../services/aiExecution.service.js";
import { consumeAiTokens } from "../services/aiToken.service.js";

import { estimateTokens } from "../utils/token.utils.js"; // simple estimator

/**
 * POST /api/ai/execute
 * Main AI entry point
 */
export const executeAi = asyncHandler(async (req, res) => {
    const user = req.user;
    const { message } = req.body;

    if (!message || !message.trim()) {
        throw new ApiError(400, "Message is required");
    }

    /**
     * 1️⃣ Create AI agent (prompt + memory)
     */
    const agent = await createAgent({
        userId: user.id,
    });

    /**
     * 2️⃣ INTENT CHAIN
     * Understand what user wants
     */
    const intentResult = await runIntentChain({
        agent,
        input: message,
    });

    /**
     * 3️⃣ PLANNER CHAIN
     * Build tasks + schedules
     */
    const plan = await runPlannerChain({
        agent,
        intent: intentResult,
    });

    /**
     * 4️⃣ REFLECTION CHAIN
     * Self-correction & sanity improvements
     */
    const refinedPlan = await runReflectionChain({
        agent,
        plan,
    });

    /**
     * 5️⃣ SAFETY VALIDATION
     */
    validateSafety(refinedPlan);

    /**
     * 6️⃣ SCHEDULE SANITY VALIDATION
     */
    validateSchedule(refinedPlan.schedules);

    /**
     * 7️⃣ TOKEN ESTIMATION + DEDUCTION
     */
    const estimatedTokens = estimateTokens(message, refinedPlan);

    await consumeAiTokens({
        userId: user.id,
        tokens: estimatedTokens,
        type: "CHAT",
    });

    /**
     * 8️⃣ EXECUTE PLAN (DB WRITES)
     */
    const executionResult = await executeAiPlan({
        userId: user.id,
        plan: refinedPlan,
    });

    /**
     * 9️⃣ RESPONSE
     */
    res.status(200).json({
        success: true,
        data: {
            summary: refinedPlan.summary,
            tasks: executionResult.tasks,
            schedules: executionResult.schedules,
            notes: refinedPlan.notes ?? [],
            remainingTokens: executionResult.remainingTokens,
        },
    });
});
