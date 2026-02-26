import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "../../../config/db.js";
import { normalizeContent } from "../contentUtils.js";

/**
 * Memory Node (Summarizer)
 *
 * 1. Generates a concise summary of the conversation so far.
 * 2. Persists the summary to DB as a SYSTEM message (for future context injection).
 * 3. Returns the summary as a SystemMessage to anchor the next turn.
 *
 * FIX: model.invoke() can return content as Array<{type,text}> (Gemini multipart).
 * Previously: `const summaryText = response.content`
 *   → If content is an array, summaryText is an array
 *   → prisma.aiMessage.create({ content: "[object Object]" }) ← corrupted summary!
 *   → SystemMessage content = array ← all downstream string ops on it crash
 *
 * Now: normalizeContent() extracts clean string from any content type.
 */
export const createMemoryNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        const summaryPrompt =
            "Distill the above chat history into a concise summary. " +
            "Capture key tasks, decisions, and user preferences.";

        const response = await model.invoke([
            ...messages,
            new HumanMessage(summaryPrompt),
        ]);

        // Normalize: Gemini may return Array<{type,text}>, string, or null
        const summaryText = normalizeContent(response.content).trim();

        if (!summaryText) {
            // No summary produced — skip DB write, return nothing
            return {};
        }

        // Persist to DB for future conversation context injection
        if (conversationId) {
            try {
                await prisma.aiMessage.create({
                    data: {
                        conversationId,
                        userId: user.id,
                        role: "SYSTEM",
                        content: `SUMMARY_MARKER: ${summaryText}`,
                        meta: { type: "SUMMARY" },
                    },
                });
            } catch (e) {
                // Non-fatal — summary storage failure doesn't break the conversation
                console.error("[MemoryNode] Failed to persist summary:", e.message);
            }
        }

        return {
            messages: [new SystemMessage(`PREVIOUS CONVERSATION SUMMARY: ${summaryText}`)],
        };
    };
};