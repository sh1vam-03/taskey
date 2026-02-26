import { runAgentGraph } from "./ai/graph/main.graph.js";
import { HumanMessage } from "@langchain/core/messages";

async function test() {
    console.log("Testing AI agent tool execution for query: 'how much task/schedules avalable for next week?' with gpt-4o-mini\n");
    const userId = "a552736b-6fc7-44c6-8acf-ba6ddf561eee";
    const user = { id: userId, timezone: "Asia/Kolkata", plan: "PRO_PLUS" };

    try {
        const result = await runAgentGraph({
            userId,
            messages: [new HumanMessage("tell me about the next week i mean how much task/schedules avalable for next week?")],
            user,
            conversationId: "fake-id",
            chatModel: "gpt-4o-mini"
        });

        console.log(`\n[FINAL OUTPUT]\n${result.content}`);
    } catch (e) {
        console.error("AI test error:", e);
    }
}

test().finally(() => process.exit(0));
