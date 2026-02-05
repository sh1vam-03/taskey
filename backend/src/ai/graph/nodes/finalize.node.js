import { AIMessage } from "@langchain/core/messages";

/**
 * Finalize Node
 * Ensures the response structure is valid and standardizes output.
 */
export const createFinalizeNode = () => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        // Ensure we always end with an AI Message, never a Tool Message (orphan tool output)
        if (lastMessage.role === 'tool') {
            // If graph stopped at Tool (shouldn't happen with our edges, but safety net)
            return {
                messages: [new AIMessage("I have finished the task.")]
            };
        }

        return {};
    };
};
