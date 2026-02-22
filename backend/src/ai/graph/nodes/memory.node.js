import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "../../../config/db.js";

/**
 * Memory Node (Summarizer)
 * 1. Generates a summary of the conversation.
 * 2. Persists the summary to DB as a SYSTEM message.
 * 3. Returns summary as System Message to anchor context for the next turn.
 */
export const createMemoryNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        const summaryPrompt =
            "Distill the above chat history into a concise summary. Capture key tasks, decisions, and user preferences.";

        const response = await model.invoke([
            ...messages,
            new HumanMessage(summaryPrompt),
        ]);

        const summaryText = response.content;

        if (conversationId) {
            try {
                await prisma.aiMessage.create({
                    data: {
                        conversationId,
                        userId: user.id,
                        role: "SYSTEM",
                        content: `SUMMARY_MARKER: ${summaryText}`,
                        meta: { type: "SUMMARY" }, // ✅ FIX: was "metadata" — AiMessage schema uses "meta Json?"
                    },
                });
            } catch (e) {
                console.error("[MemoryNode] Failed to persist summary:", e);
            }
        }

        return {
            messages: [new SystemMessage(`PREVIOUS CONVERSATION SUMMARY: ${summaryText}`)],
        };
    };
};
