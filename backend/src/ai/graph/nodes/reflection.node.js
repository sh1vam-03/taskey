import { SystemMessage } from "@langchain/core/messages";
import { normalizeContent } from "../contentUtils.js";

/**
 * Reflection Node
 * Reviews the state after tool execution.
 * If errors are detected in tool outputs, injects guidance for the Agent to retry.
 *
 * FIX: lastMessage.content can be Array<{type,text}> (LangChain ToolMessage).
 * Calling Array.includes("Error:") checks for exact element membership, not substring.
 * It would silently return false even when the tool response contains an error.
 * Content is now normalized to string before the substring check.
 */
export const createReflectionNode = (model) => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        // LangChain ToolMessage type check — works across all message types
        const isToolMessage =
            lastMessage?.getType?.() === "tool" ||
            lastMessage?._getType?.() === "tool" ||
            lastMessage?.role === "tool";

        if (isToolMessage) {
            // Normalize to string before substring check
            const contentText = normalizeContent(lastMessage.content);

            if (
                contentText.includes("Error:") ||
                contentText.includes('"success":false') ||
                contentText.includes("failed")
            ) {
                return {
                    messages: [
                        new SystemMessage(
                            "The previous tool call failed. Analyze the error, correct your inputs, and try again."
                        )
                    ]
                };
            }
        }

        // No error detected — Agent continues naturally
        return {};
    };
};