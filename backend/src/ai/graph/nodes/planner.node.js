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

        const isReadQuery = content.match(/\b(what|show|tell|list|fetch|get|existing)\b/i);
        const hasTimeWord = content.match(/\b(today|tomorrow|yesterday|week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);

        // 1. Calendar & Schedule Reading (Highest priority if it asks for user's own data)
        if (
            isReadQuery &&
            (content.includes("schedule") || content.includes("task") || content.includes("plan") || content.includes("routine")) &&
            (hasTimeWord || content.includes("my"))
        ) {
            intentHint = "User Intent: CALENDAR QUERY. Use 'list_schedules' tool to mathematically calculate the date boundaries and fetch the user's real schedule from the database. DO NOT CREATE OR HALLUCINATE A NEW ROUTINE.";
        }

        // 2. Planning / Scheduling Creation Intent
        else if (
            content.includes("schedule") ||
            content.includes("plan") ||
            content.includes("routine") ||
            content.includes("timetable")
        ) {
            intentHint = "User Intent: PLANNING. Create a structured schedule. Ensure breaks and meals are included.";
        }

        // 3. Task Management Creation/Update Intent
        else if (
            content.includes("task") ||
            content.includes("todo") ||
            content.includes("remind")
        ) {
            if (isReadQuery) {
                intentHint = "User Intent: TASK LISTING. Use 'list_tasks' to fetch existing tasks from the database.";
            } else {
                intentHint = "User Intent: TASK MANAGEMENT. Use CRM tools (create_task, update_task) to manage list.";
            }
        }

        // 4. Info / External Research Intent (e.g. holidays)
        else if (
            content.includes("search") ||
            content.includes("find") ||
            content.includes("holiday") ||
            content.includes("festival") ||
            content.includes("diwali") ||
            content.match(/\bwhat is \b(?!my)/i) // match "what is" but not "what is my"
        ) {
            intentHint = "User Intent: RESEARCH/INFO. Use 'web_search' to verify facts/dates on the internet.";
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