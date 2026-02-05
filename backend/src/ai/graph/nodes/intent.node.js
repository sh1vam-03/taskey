import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { buildSystemContext } from "../../services/aiContext.service.js";

export const createIntentNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable; // Access user from config

        // Build Context
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);


        // Invoke Model
        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            ...messages
        ]);

        return { messages: [response] };
    };
};
