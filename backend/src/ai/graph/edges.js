import { END } from "@langchain/langgraph";
import { normalizeContent } from "./contentUtils.js";

/**
 * Routing edge after the Agent node.
 *
 * Decides what to do next:
 *   "tools"     → agent wants to call a tool
 *   "summarize" → conversation is getting too long, compress it
 *   END         → response is ready, finish
 *
 * FIX: content must be normalized to string before calling .length.
 * Gemini returns content as Array<{type, text}> for tool-use turns.
 * Array.length counts elements (e.g. 1), not characters → vastly wrong
 * token estimate → summarize never triggers correctly.
 */
export const shouldContinue = (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    // 1. Tool Call — agent requested a tool
    if (lastMessage.tool_calls?.length) {
        return "tools";
    }

    // 2. Token Limit Check — summarize if context is growing too large.
    // Normalize each message content to string before measuring length.
    const totalTokens = messages.reduce((acc, msg) => {
        const text = normalizeContent(msg.content);
        return acc + text.length / 4; // ~4 chars per token
    }, 0);

    if (totalTokens > 4000) {
        return "summarize";
    }

    return END;
};