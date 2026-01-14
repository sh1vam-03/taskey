import { createAgent } from "../agent/agent.factory.js";
import { runIntentChain } from "../chains/intent.chain.js";
import { runPlannerChain } from "../chains/planner.chain.js";
import { runReflectionChain } from "../chains/reflection.chain.js";
import { validateSafety } from "../validators/safety.validator.js";
import { validateSchedule } from "../validators/schedule.validator.js";
import { executeAiPlan } from "./aiExecution.service.js";
import { estimateTokens } from "../utils/token.utils.js"; // simple estimator
import ApiError from "../../utils/ApiError.js";

/**
 * AI Orchestrator
 * --------------
 * Single entry point for ALL AI Logic (Text & Voice)
 * Ensuring consistency across the platform.
 */
export const processAiRequest = async ({ userId, message, mode = "TEXT" }) => {
    if (!message || !message.trim()) {
        throw new ApiError(400, "Message is required");
    }

    /**
     * 1️⃣ Create AI agent (prompt + memory)
     */
    const agent = await createAgent({
        userId,
    });

    /**
     * 2️⃣ INTENT CHAIN
     */
    const intentResult = await runIntentChain({
        agent,
        input: message,
    });

    /**
     * 3️⃣ PLANNER CHAIN
     */
    const plan = await runPlannerChain({
        agent,
        intent: intentResult,
    });

    /**
     * 4️⃣ REFLECTION CHAIN
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
    if (refinedPlan.schedules && refinedPlan.schedules.length > 0) {
        validateSchedule(refinedPlan.schedules);
    }

    /**
     * 7️⃣ TOKEN ESTIMATION + DEDUCTION
     * Voice mode might cost more, handled here if needed.
     */
    const estimatedTokens = estimateTokens(message, refinedPlan);
    const costMultiplier = mode === "VOICE" ? 1.5 : 1;
    const finalCost = Math.ceil(estimatedTokens * costMultiplier);

    /**
     * 8️⃣ EXECUTE PLAN (DB WRITES + TOKEN DEDUCTION)
     */
    const executionResult = await executeAiPlan({
        userId,
        plan: refinedPlan,
        estimatedTokens: finalCost,
        aiUsageType: mode === "VOICE" ? "VOICE" : "CHAT",
    });

    return {
        summary: refinedPlan.summary,
        tasks: executionResult.tasks,
        schedules: executionResult.schedules,
        notes: refinedPlan.notes ?? [],
        remainingTokens: executionResult.remainingTokens,
        tokensUsed: finalCost,
    };
};
