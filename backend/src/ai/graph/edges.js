import { END } from "@langchain/langgraph";

export const shouldContinue = (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    // 1. Tool Call?
    if (lastMessage.tool_calls?.length) {
        return "tools";
    }

    // 2. Token Limit Check (Summarize)
    // Approximate token count across all messages
    const totalTokens = messages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0);

    if (totalTokens > 4000) {
        return "summarize";
    }

    return END;
};
