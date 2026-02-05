import { SystemMessage } from "@langchain/core/messages";

/**
 * Reflection Node
 * Reviews the state after tool execution.
 * If errors are detected in tool outputs, it injects guidance for the Agent to retry.
 */
export const createReflectionNode = (model) => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        // Check if the last message was a Tool Message with an error
        if (lastMessage.role === 'tool' && (
            lastMessage.content.includes("Error:") ||
            lastMessage.content.includes("failed")
        )) {
            // Inject a system hint to encourage fixing the error
            return {
                messages: [
                    new SystemMessage("The previous tool call failed. Analyze the error, correct your inputs, and try again.")
                ]
            };
        }

        // If no error, pass through (Agent handles success naturally)
        return {};
    };
};
