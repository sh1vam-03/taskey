import { SystemMessage } from "@langchain/core/messages";
import { buildSystemContext } from "../../services/aiContext.service.js";

/**
 * Intent / Agent Node
 *
 * Receives a pre-bound model (with tools attached) from the graph compiler.
 * Builds the full system context for this request and invokes the model.
 *
 * The model is passed in — this node does NOT instantiate its own LLM.
 * That responsibility belongs to main.graph.js (compileOpenAIGraph).
 */
export const createIntentNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        // Build context-rich system prompt (tasks, schedule, behavior logs, summary)
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            ...messages,
        ], { tags: ["agent_llm"] });

        return { messages: [response] };
    };
};