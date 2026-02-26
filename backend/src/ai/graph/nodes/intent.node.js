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

        const outMessages = [
            new SystemMessage(systemPrompt),
            ...messages
        ];

        console.log(`[IntentNode] Sending ${outMessages.length} messages. Payload Sizes:`);
        outMessages.forEach((m, i) => {
            console.log(`  [${i}] ${m._getType()} : ${m.content?.length || 0} chars`);
        });

        const response = await model.invoke(outMessages, { tags: ["agent_llm"] });

        return { messages: [response] };
    };
};