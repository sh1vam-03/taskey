import { runAgentGraph } from "../graph/main.graph.js";

/**
 * AI Execution Service
 * Abstraction layer over the LangGraph runner.
 * Handles validation, logging, and standardization of inputs/outputs.
 */
export const executeAgent = async (params) => {
    const { userId, messages, user, conversationId } = params;

    // 1. Validation
    if (!userId) throw new Error("executeAgent: userId is required");
    if (!messages || !Array.isArray(messages)) throw new Error("executeAgent: messages array is required");

    // 2. Execution
    try {
        const start = Date.now();

        // Execute Graph
        const result = await runAgentGraph({
            userId,
            messages,
            user,
            conversationId
        });

        const duration = Date.now() - start;
        // console.log(`[AI-EXEC] Graph finished in ${duration}ms for user ${userId}`);

        return result;

    } catch (error) {
        console.error("[AI-EXEC] Graph Execution Failed:", error);
        // We could re-throw a clearer error or return a fallback message
        throw new Error(`AI Agent validation failed: ${error.message}`);
    }
};
