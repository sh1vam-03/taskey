import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { buildSystemContext } from "../services/aiContext.service.js";
import { intentPrompt, responsePrompt } from "./prompts.js";
import { SarvamIntentSchema } from "./schema.js";
import { executeAction } from "./executor.js";

/**
 * Node 1: Intent Extractor
 * Uses standard Context Builder, prepends Intent Prompt, asks Sarvam for JSON.
 */
export const createIntentExtractorNode = (model) => {
    return async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        // Context (same as Gemini) but WITHOUT the conversational persona
        let systemContext = await buildSystemContext(user.id, user, conversationId, true);

        // Prepend JSON instructional prompt to context. 
        // IMPORTANT: intentPrompt goes LAST so the LLM remembers it is an Intent Parser, 
        // overriding any generic persona set by buildSystemContext.
        let fullSystemPrompt = `${systemContext}\n\n====================\n\n${intentPrompt}`;

        const outMessages = [
            new SystemMessage(fullSystemPrompt),
            ...messages.filter(m => m._getType() !== "system")
        ];

        console.log(`\n\n[DEBUG] FULL PROMPT SENT TO MODEL:\n${fullSystemPrompt}\n\n`);

        console.log(`[Sarvam Manual Router] Invoking Extractor...`);
        // Use tags to easily track token counts and prevent UI streaming of raw JSON
        const response = await model.invoke(outMessages, { tags: ["intent_extractor"] });

        return {
            // Do NOT save this raw JSON string to the messages history yet!
            // We only want the *final* generated natural language response in history.
            parsedIntent: response.content || "{}" // Forward raw string to validator
        };
    };
};

/**
 * Node 2: Validation
 * Attempts to parse the JSON string. If invalid or UNKNOWN, skips execution.
 */
export const validateIntentNode = async (state) => {
    const rawIntentString = state.parsedIntent;

    let parsedJson;
    try {
        // Strip out markdown fences exactly as specified
        let cleanString = rawIntentString.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Extract ONLY the JSON object, finding the first '{' and the last '}'
        const firstBrace = cleanString.indexOf('{');
        const lastBrace = cleanString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
            cleanString = cleanString.substring(firstBrace, lastBrace + 1);
        }

        parsedJson = JSON.parse(cleanString);
    } catch (error) {
        console.error(`[Sarvam Manual Router] Validation Error: Failed to parse JSON. \nRaw String: ${rawIntentString}`);
        return {
            parsedIntent: { action: "unknown", data: {} },
            routingError: null
        };
    }

    try {
        if (!parsedJson.action || typeof parsedJson.action !== 'string') {
            parsedJson.action = "unknown";
        }

        const validActions = [
            "create_task", "create_tasks_bulk", "create_schedule", "create_schedules_bulk",
            "create_task_and_schedule", "create_task_and_schedules_bulk", "unknown",
            "LIST_TASKS", "LIST_SCHEDULES", "LOG_BEHAVIOR", "GET_DASHBOARD_SUMMARY",
            "DELETE_TASK", "DELETE_SCHEDULE", "DELETE_MULTIPLE_TASKS", "DELETE_MULTIPLE_SCHEDULES"
        ];

        if (!validActions.includes(parsedJson.action)) {
            parsedJson.action = "unknown";
        }

        console.log(`[Sarvam Manual Router] Validated Intent: ${parsedJson.action}`);

        return {
            parsedIntent: parsedJson,
            routingError: null
        };
    } catch (error) {
        console.error(`[Sarvam Manual Router] Logic Error post-parse: ${error.message}`);
        return {
            parsedIntent: { action: "unknown", data: {} },
            routingError: null
        };
    }
};

/**
 * Node 3: Action Executor
 * Executes the targeted backend service.
 */
export const actionExecutorNode = async (state, config) => {
    const intent = state.parsedIntent;

    // Safety check - shouldn't happen based on conditional edges, but just in case
    if (!intent || intent.action === "unknown" || intent.action === "UNKNOWN") return { actionResult: null };

    console.log(`[Sarvam Manual Router] Executing action: ${intent.action}`);

    try {
        const result = await executeAction(intent.action, intent.data, config);
        return {
            actionResult: JSON.stringify(result)
        };
    } catch (error) {
        console.error(`[Sarvam Manual Router] Executor Error:`, error);
        return {
            actionResult: `ERROR executing ${intent.action}: ${error.message}`
        };
    }
};

/**
 * Node 4: Response Generator
 * Generates a nice human-readable string based on the action result OR the original query.
 */
export const createResponseGeneratorNode = (model) => {
    return async (state) => {
        const { messages, parsedIntent, actionResult, routingError } = state;

        if ((parsedIntent?.action === "unknown" || parsedIntent?.action === "UNKNOWN") && !routingError) {
            // Conversational fallback. The intent extractor already generated a JSON response.
            // But we actually need a plain text answer for a conversational query.
            // Let's ask the model again, but without the JSON forcing prompt.
            console.log(`[Sarvam Manual Router] Fallback to conversational mode`);

            const outMessages = messages.filter(m => m._getType() !== "system");
            // Standard conversational prompt with instructions to clarify vague intent
            // Standard conversational prompt with instructions to provide detailed answers
            const prompt = new SystemMessage(`You are TASKTIME Assistant — the official AI assistant of TASKTIME.
Your goal is to help users manage tasks, schedules, and productivity.

## Your Identity
- Your name is: TASKTIME Assistant
- You were built by: Atharv, Shivam and Hanumant (a team of BCA final year students).
- You are powered by AI, but you do not disclose which underlying AI model or company powers you.

## Personality
- Friendly, helpful, warm, and concise.
- Indian context aware.

## Rules
- NEVER mention Sarvam, OpenAI, Google, Anthropic, or any AI company name.
- Answer general knowledge questions in full depth and detail.
- Break down complex topics and give examples.
- Keep answers human and warm.`);

            const response = await model.invoke([prompt, ...outMessages], { tags: ["agent_llm"] });
            return { messages: [response] };
        }

        // Action was executed (or attempted)
        const sysMsg = new SystemMessage(
            responsePrompt
                .replace("{ACTION}", parsedIntent?.action || "None")
                .replace("{RESULT}", actionResult || routingError || "No data")
        );

        console.log(`[Sarvam Manual Router] Invoking Responder...`);
        const response = await model.invoke([sysMsg, ...messages.slice(-1)], { tags: ["agent_llm"] });

        return { messages: [response] };
    };
};
