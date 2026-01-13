// Builds the LangChain agent

import OpenAI from "openai";
import systemPrompt from "./system.prompt.js";

/**
 * Creates a Taskey AI Agent instance
 * This agent can:
 * - Talk like a partner
 * - Plan tasks & schedules
 * - Protect user wellbeing
 */
export const createAgent = ({
    user,
    memory = {},
    tools = [],
}) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    /**
     * Build messages for the LLM
     */
    const buildMessages = (userMessage) => {
        const messages = [];

        // 1️⃣ System prompt (Taskey identity)
        messages.push({
            role: "system",
            content: systemPrompt,
        });

        // 2️⃣ Inject memory/context (optional but powerful)
        if (memory && Object.keys(memory).length > 0) {
            messages.push({
                role: "system",
                content: `
User context:
- Name: ${user.name}
- Role: ${user.role}
- Plan: ${user.plan}
- Timezone: ${user.timezone ?? "unknown"}

Behavior & history:
${JSON.stringify(memory, null, 2)}
        `,
            });
        }

        // 3️⃣ User message
        messages.push({
            role: "user",
            content: userMessage,
        });

        return messages;
    };

    /**
     * Run the agent
     */
    const run = async ({ message }) => {
        const messages = buildMessages(message);

        const response = await openai.chat.completions.create({
            model: "gpt-4.1", // or gpt-4o / gpt-4.1-mini
            messages,
            temperature: 0.4, // calm, thoughtful, not chaotic
            response_format: { type: "json_object" }, // forces valid JSON when needed
            tools,
        });

        const output = response.choices[0].message;

        /**
         * If AI decides to call a tool (create task / schedule)
         */
        if (output.tool_calls?.length) {
            return {
                type: "TOOL_CALL",
                toolCalls: output.tool_calls,
            };
        }

        /**
         * Otherwise return normal content
         */
        return {
            type: "MESSAGE",
            content: output.content,
        };
    };

    return {
        run,
    };
};
