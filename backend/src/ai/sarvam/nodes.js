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

        // Context (same as Gemini)
        let systemContext = await buildSystemContext(user.id, user, conversationId);

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

    try {
        // Strip out any potential markdown blocks the LLM might incorrectly add
        let cleanString = rawIntentString.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Extract ONLY the JSON object from the string, ignoring any reasoning text the LLM appended.
        const jsonMatch = cleanString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanString = jsonMatch[0];
        }

        const parsedJson = JSON.parse(cleanString);

        if (!parsedJson.action || typeof parsedJson.action !== 'string') {
            throw new Error("Missing or invalid 'action' field in JSON");
        }

        const validActions = [
            "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", "LIST_TASKS",
            "CREATE_SCHEDULE", "UPDATE_SCHEDULE", "DELETE_SCHEDULE", "LIST_SCHEDULES",
            "LOG_BEHAVIOR", "GET_DASHBOARD_SUMMARY", "UNKNOWN"
        ];

        if (!validActions.includes(parsedJson.action)) {
            parsedJson.action = "UNKNOWN";
        }

        console.log(`[Sarvam Manual Router] Validated Intent: ${parsedJson.action}`);

        return {
            parsedIntent: parsedJson,
            routingError: null
        };
    } catch (error) {
        console.error(`[Sarvam Manual Router] Validation Error: ${error.message} \nRaw String: ${rawIntentString}`);
        return {
            // Fallback to unknown if the JSON is garbled, allowing organic conversation
            parsedIntent: { action: "UNKNOWN", data: {} },
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
    if (!intent || intent.action === "UNKNOWN") return { actionResult: null };

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

        if (parsedIntent?.action === "UNKNOWN" && !routingError) {
            // Conversational fallback. The intent extractor already generated a JSON response.
            // But we actually need a plain text answer for a conversational query.
            // Let's ask the model again, but without the JSON forcing prompt.
            console.log(`[Sarvam Manual Router] Fallback to conversational mode`);

            const outMessages = messages.filter(m => m._getType() !== "system");
            // Standard conversational prompt with instructions to clarify vague intent
            const prompt = new SystemMessage(`You are TaskTime AI Assistant.
If the user is trying to create or manage a task/schedule but didn't provide enough details (like a title or date), politely ask them for the missing information.
Otherwise, answer their question conversationally. 
Do not invent or create things in your response if they didn't provide the details.
Format nicely in markdown and keep it concise.`);

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
