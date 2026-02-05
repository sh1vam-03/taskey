import { SystemMessage } from "@langchain/core/messages";

/**
 * Planner Node
 * Analyzes the conversation to determine high-level intent.
 * Injects guidance into the state to help the Agent Node focus.
 */
export const createPlannerNode = (model) => {
    return async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || !lastMessage.content) return {};

        const content = lastMessage.content.toLowerCase();

        let intentHint = "";

        // 1. Info / Research Intent
        if (
            content.includes("search") ||
            content.includes("what is") ||
            content.includes("find") ||
            content.includes("holiday") ||
            content.includes("festival") ||
            content.includes("diwali") || // Specific user example
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
        else if (content.includes("analyze") || content.includes("how was") || content.includes("stats")) {
            intentHint = "User Intent: REFLECTION. Analyze past behavior/logs.";
        }

        if (intentHint) {
            // We inject this as a transient System Message (or we could start a separate 'plan' channel)
            return {
                messages: [new SystemMessage(`[PLANNER GUIDE]: ${intentHint}`)]
            };
        }

        // 5. Fallback: Ask Model (Advanced Planning)
        // If no regex matched, we ask the model to clarify intent briefly.
        // This makes the planner "real" instead of just heuristic.
        try {
            const plannerResponse = await model.invoke([
                new SystemMessage("Analyze the user's latest message. Return a single sentence 'GUIDANCE' to help the agent focus. If unsure, return empty string."),
                lastMessage
            ]);

            if (plannerResponse.content && plannerResponse.content.length > 5) {
                return {
                    messages: [new SystemMessage(`[PLANNER GUIDE]: ${plannerResponse.content}`)]
                };
            }
        } catch (e) {
            // Fallback to no guidance
        }

        return {};
    };
};
