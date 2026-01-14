import OpenAI from "openai";
import systemPrompt from "../agent/system.prompt.js";
import { runReflectionChain } from "./reflection.chain.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Planner Chain
 * Responsible for generating a complete daily plan
 */
export async function runPlannerChain({
    userMessage,
    intent,
    memoryContext,
    profileContext,
    constraints,
}) {
    const messages = [
        {
            role: "system",
            content: systemPrompt,
        },

        // Memory context (habits, past behavior)
        {
            role: "system",
            content: memoryContext
                ? `User Memory:\n${JSON.stringify(memoryContext, null, 2)}`
                : "User Memory: None",
        },

        // Profile context (student, timezone, plan)
        {
            role: "system",
            content: profileContext
                ? `User Profile:\n${JSON.stringify(profileContext, null, 2)}`
                : "User Profile: None",
        },

        // Constraints (college, gym, fixed events)
        {
            role: "system",
            content: constraints
                ? `Constraints:\n${JSON.stringify(constraints, null, 2)}`
                : "Constraints: None",
        },

        // Intent (already extracted)
        {
            role: "system",
            content: `User Intent:\n${JSON.stringify(intent, null, 2)}`,
        },

        // User message
        {
            role: "user",
            content: userMessage,
        },
    ];

    // 1️⃣ Generate initial plan
    const initialResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3, // stable, not creative nonsense
    });

    const rawPlan = initialResponse.choices[0].message.content;

    // 2️⃣ Self-reflection & correction
    const finalPlan = await runReflectionChain({
        originalPlan: rawPlan,
        memoryContext,
        profileContext,
    });

    // 3️⃣ Parse JSON safely
    let parsedPlan;
    try {
        parsedPlan = JSON.parse(finalPlan);
    } catch (err) {
        throw new Error("AI returned invalid JSON plan");
    }

    return parsedPlan;
}
