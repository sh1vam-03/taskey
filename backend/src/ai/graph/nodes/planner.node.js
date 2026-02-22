import { SystemMessage } from "@langchain/core/messages";
import { normalizeContent } from "../contentUtils.js";

/**
 * Planner Node
 * Analyzes the conversation to determine high-level intent.
 * Injects guidance into the state to help the Agent Node focus.
 *
 * FIX: lastMessage.content can be Array<{type,text}> (Gemini multipart) or null.
 * Calling .toLowerCase() on an array throws TypeError: content.toLowerCase is not a function.
 * All content access now goes through normalizeContent() first.
 */
export const createPlannerNode = (model) => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) return {};

        // Normalize to string — safe for all LangChain message types
        const content = normalizeContent(lastMessage.content).toLowerCase();

        // Guard: skip planner logic if there's no meaningful text content
        // (e.g. pure tool-call messages have empty content after normalization)
        if (!content.trim()) return {};

        let intentHint = "";

        // 1. Info / Research Intent
        if (
            content.includes("search") ||
            content.includes("what is") ||
            content.includes("find") ||
            content.includes("holiday") ||
            content.includes("festival") ||
            content.includes("diwali") ||
            content.includes("date")
        ) {
            intentHint = "User Intent: RESEARCH/INFO. Use 'web_search' to verify facts/dates before planning.";
        }

        // 2. Planning / Scheduling Intent
        else if (
            content.includes("schedule") ||
            content.includes("plan") ||
            content.includes("routine") ||
            content.includes("timetable")
        ) {
            intentHint = "User Intent: PLANNING. Create a structured schedule. Ensure breaks and meals are included.";
        }

        // 3. Task Management Intent
        else if (
            content.includes("task") ||
            content.includes("todo") ||
            content.includes("remind")
        ) {
            intentHint = "User Intent: TASK MANAGEMENT. Use CRM tools (create_task, update_task) to manage list.";
        }

        // 4. Analysis / Reflection
        else if (
            content.includes("analyze") ||
            content.includes("how was") ||
            content.includes("stats")
        ) {
            intentHint = "User Intent: REFLECTION. Analyze past behavior/logs.";
        }

        if (intentHint) {
            return {
                messages: [new SystemMessage(`[PLANNER GUIDE]: ${intentHint}`)]
            };
        }

        // 5. Fallback: ask the model to classify intent
        try {
            const plannerResponse = await model.invoke([
                new SystemMessage(
                    "Analyze the user's latest message. Return a single sentence 'GUIDANCE' " +
                    "to help the agent focus. If unsure, return empty string."
                ),
                lastMessage
            ]);

            const guidance = normalizeContent(plannerResponse.content).trim();
            if (guidance.length > 5) {
                return {
                    messages: [new SystemMessage(`[PLANNER GUIDE]: ${guidance}`)]
                };
            }
        } catch {
            // Non-fatal — planner falls back to no guidance
        }

        return {};
    };
};