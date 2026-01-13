// Planning + reasoning agent

import OpenAI from "openai";
import systemPrompt from "./system.prompt.js";
import { memoryManager } from "./memory.manager.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Planner Agent
 * -------------
 * Responsible for thinking, planning, and returning
 * FINAL actionable daily plans in JSON
 */
export const plannerAgent = {
    /**
     * Main entry point
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.userMessage (natural language)
     */
    async planDay({ userId, userMessage }) {
        // 1️⃣ Load memory snapshot
        const memory = await memoryManager.getAgentMemory(userId);

        // 2️⃣ Build messages
        const messages = [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "system",
                content: `User memory snapshot (use silently for planning):\n${JSON.stringify(
                    memory
                )}`,
            },
            {
                role: "user",
                content: userMessage,
            },
        ];

        // 3️⃣ Call AI
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini", // fast + smart + cheap
            messages,
            temperature: 0.4, // stable planning
            response_format: { type: "json_object" },
        });

        const rawOutput = completion.choices[0].message.content;

        // 4️⃣ Parse safely
        let plan;
        try {
            plan = JSON.parse(rawOutput);
        } catch (err) {
            throw new Error("AI returned invalid JSON");
        }

        // 5️⃣ Minimal validation (structure only)
        validatePlan(plan);

        // 6️⃣ Return final plan
        return plan;
    },
};

/* ───────────────────────── VALIDATION ───────────────────────── */

function validatePlan(plan) {
    if (!plan || typeof plan !== "object") {
        throw new Error("Invalid plan format");
    }

    if (!Array.isArray(plan.tasks)) {
        throw new Error("Plan must include tasks array");
    }

    if (!Array.isArray(plan.schedules)) {
        throw new Error("Plan must include schedules array");
    }

    for (const s of plan.schedules) {
        if (!s.taskTitle || !s.startTime || !s.endTime) {
            throw new Error("Invalid schedule entry");
        }
    }
}
