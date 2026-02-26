import { AIMessage } from "@langchain/core/messages";
import { normalizeContent } from "../contentUtils.js";

/**
 * Finalize Node
 * Ensures the graph always ends with a proper AIMessage.
 *
 * FIX: LangChain ToolMessage objects do NOT have .role === 'tool'.
 * The .role property is undefined on LangChain message instances.
 * The correct check is .getType() === "tool" (LangChain's internal method)
 * or checking the constructor/class name.
 *
 * Previous code: lastMessage.role === 'tool'
 *   → always false → orphaned tool outputs were never caught
 *
 * Also normalizes content to string before returning, so callers always
 * get a clean string from the final message.
 */
export const createFinalizeNode = () => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) {
            return {
                messages: [new AIMessage("I'm ready to help. What would you like to do?")]
            };
        }

        // Correct LangChain type check — works for all message types
        const isToolMessage =
            lastMessage?.getType?.() === "tool" ||
            lastMessage?._getType?.() === "tool" ||
            lastMessage?.role === "tool"; // keep as fallback for plain objects

        if (isToolMessage) {
            // Orphaned tool output — graph should not end on a ToolMessage.
            // This is a safety net; with correct edges this shouldn't happen.
            return {
                messages: [new AIMessage("I've completed the action. Is there anything else you need?")]
            };
        }

        // If content is array (Gemini multipart), normalize to string.
        // This ensures the final message stored in state is always a string,
        // which the orchestrator can safely save to DB and bill tokens against.
        const contentText = normalizeContent(lastMessage.content);
        if (contentText !== lastMessage.content) {
            // Replace the last message with a clean string-content AIMessage
            return {
                messages: [new AIMessage(contentText)]
            };
        }

        return {};
    };
};