import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "../../../config/db.js"; // Ensure path is correct

/**
 * Memory Node (Summarizer)
 * 1. Generates a summary of the conversation.
 * 2. Persists the summary to DB (as a distinct System Message or Meta field).
 * 3. Cleans up old context (in State).
 */
export const createMemoryNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user } = config.configurable;

        // Heuristic: Only summarize if we have substantial history (> 10 messages)
        // logic moved here from edges.js mostly

        const summaryPrompt = "Distill the above chat history into a concise summary. Capture key tasks, decisions, and user preferences.";

        const response = await model.invoke([
            ...messages,
            new HumanMessage(summaryPrompt)
        ]);

        const summaryText = response.content;

        // PERSISTENCE (Fix 2)
        // Find active conversation ID from the last message or context?
        // In LangGraph state, we might not have the Conversation ID explicitly unless we pass it in 'configurable'.
        // We do pass 'user' in configurable. We should ideally pass 'conversationId' too.
        // Assuming we update 'runAgentGraph' to pass conversationId.

        const conversationId = config.configurable.conversationId;

        if (conversationId) {
            try {
                // Save as a SYSTEM message to act as a permanent anchor
                await prisma.aiMessage.create({
                    data: {
                        conversationId,
                        userId: user.id,
                        role: "SYSTEM",
                        content: `SUMMARY_MARKER: ${summaryText}`,
                        metadata: { type: "SUMMARY" } // Clean tagging
                    }
                });
            } catch (e) {
                console.error("Failed to persist summary:", e);
            }
        }

        // Return summary as a System Message to reset the context window in the *next* turn
        // Note: In a real "trimming" implementation, we would return a "delete" operation for old messages.
        // For V1, we just return the summary to append it.
        return { messages: [new SystemMessage(`PREVIOUS CONVERSATION SUMMARY: ${summaryText}`)] };
    };
};
