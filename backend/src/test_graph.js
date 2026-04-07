import { streamAgentGraph } from "./ai/graph/main.graph.js";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END, START } from "@langchain/langgraph";
import { graphState } from "./ai/graph/state.schema.js";
import { createIntentNode } from "./ai/graph/nodes/intent.node.js";
import { createMemoryNode } from "./ai/graph/nodes/memory.node.js";
import { createFinalizeNode } from "./ai/graph/nodes/finalize.node.js";

dotenv.config();

process.env.LANGCHAIN_VERBOSE = "true";

async function test() {
    console.log("Compiling sarvam-30b graph...");
    const model = new ChatOpenAI({
        model: "sarvam-30b",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming: true,
        configuration: {
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY
            }
        }
    });

    const workflow = new StateGraph({ channels: graphState })
        .addNode("agent", createIntentNode(model))
        .addNode("summarize", createMemoryNode(model))
        .addNode("finalize", createFinalizeNode())
        .addEdge(START, "agent")
        .addEdge("agent", "summarize")
        .addEdge("summarize", "finalize")
        .addEdge("finalize", END);

    const app = workflow.compile();

    const stream = await app.streamEvents(
        { messages: [new HumanMessage("Hello")] },
        {
            configurable: { user: { plan: "FREE" }, userId: "123", conversationId: "abc" },
            version: "v1"
        }
    );

    let started = false;
    for await (const event of stream) {
        if (!started) {
            console.log("FIRST CHUNK RECEIVED!");
            started = true;
        }
        console.log(`Event:`, event.event, "Node:", event.name);
        if (event.event === "on_chat_model_stream" || event.event === "on_llm_stream") {
            const chunk = event.data?.chunk;
            const content = chunk?.content || chunk?.text || chunk?.message?.content;
            if (content) {
                console.log(`[${Date.now()}] Chunk length: ${content.length} characters -> ${JSON.stringify(content.substring(0, 30))}...`);
            }
        }
    }
    console.log("Stream finished.");
}
test().catch(console.error);
