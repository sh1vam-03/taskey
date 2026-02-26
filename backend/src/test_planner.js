import { createPlannerNode } from "./ai/graph/nodes/planner.node.js";
import { HumanMessage } from "@langchain/core/messages";

async function test() {
    // Mock the model to just be an empty function for the fallback
    const mockModel = { invoke: async () => ({ content: "" }) };
    const planner = createPlannerNode(mockModel);

    const testPhrases = [
        "what is my schedule for next week?",
        "what is existing task of next week?",
        "show me my tasks for tomorrow",
        "plan my schedule for next week",
        "create a new task to buy milk",
        "what is diwali?", // should hit research
        "list my tasks" // no time word, but has "my"
    ];

    console.log("Testing Planner Intent Routing:");
    console.log("===============================");

    for (const phrase of testPhrases) {
        const result = await planner({ messages: [new HumanMessage(phrase)] });
        const hint = result.messages && result.messages.length > 0
            ? result.messages[0].content
            : "NO HINT GIVEN";
        console.log(`\nUser: "${phrase}"`);
        console.log(`Hint: ${hint}`);
    }
}

test().catch(console.error);
