import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { graphState } from "./state.schema.js";

import { createIntentNode } from "./nodes/intent.node.js";
import { createToolNode, getBoundTools } from "./nodes/tool.node.js";
import { createMemoryNode } from "./nodes/memory.node.js";
import { createPlannerNode } from "./nodes/planner.node.js";
import { createReflectionNode } from "./nodes/reflection.node.js";
import { createFinalizeNode } from "./nodes/finalize.node.js";
import { shouldContinue } from "./edges.js";

// GLOBAL CACHE
// Map<userId, CompiledGraph>
const graphCache = new Map();

// Global Graph Key:
// Since our tools are stateless (config-based) and the model is standard,
// we can use a single compiled graph instance for all users.
// State is maintained per-invocation via the 'checkpoint' mechanism (memory), not the graph definition.
const GRAPH_KEY = "standard-graph";

/**
 * Main Agent Graph Orchestrator
 */
export const runAgentGraph = async ({ userId, messages, user, conversationId }) => {
    // 1. Check Cache (Singleton)
    if (graphCache.has(GRAPH_KEY)) {
        // console.log(`[GRAPH] Cache Hit for user: ${userId}`);
        const app = graphCache.get(GRAPH_KEY);

        // Invoke (State is per-invocation)
        const finalState = await app.invoke(
            { messages },
            { configurable: { user, userId, conversationId } } // Ensure userId is passed
        );
        return finalState.messages[finalState.messages.length - 1];
    }

    // console.log(`[GRAPH] Cache Miss - Compiling for user: ${userId}`);

    // 2. Initialize Tools & Model (Generic)
    const tools = getBoundTools(); // No userId needed
    const model = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,   // Fix 2: 30s timeout
        maxRetries: 2     // Fix 2: Retry logic
    }).bindTools(tools);

    // 3. Initialize Nodes
    const intentNode = createIntentNode(model);
    const toolNode = createToolNode(tools);
    const memoryNode = createMemoryNode(model);
    const plannerNode = createPlannerNode(model);
    const reflectionNode = createReflectionNode(model);
    const finalizeNode = createFinalizeNode();

    // 4. Build Graph
    const workflow = new StateGraph({
        channels: graphState
    })
        .addNode("planner", plannerNode)
        .addNode("agent", intentNode)
        .addNode("tools", toolNode)
        .addNode("reflection", reflectionNode)
        .addNode("summarize", memoryNode)
        .addNode("finalize", finalizeNode)

        // Flow Logic
        .addEdge(START, "planner")
        .addEdge("planner", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "reflection")
        .addEdge("reflection", "agent")
        .addEdge("summarize", "finalize")
        .addEdge("finalize", END);

    // 5. Compile & Cache
    const app = workflow.compile();

    // Cache Eviction Policy (Not really needed for singleton, but keeps it safe)
    if (graphCache.size > 10) {
        graphCache.clear();
    }

    graphCache.set(GRAPH_KEY, app);

    // 6. Run
    const finalState = await app.invoke(
        { messages },
        { configurable: { user, userId, conversationId } }
    );

    return finalState.messages[finalState.messages.length - 1];
};
