/**
 * Main Agent Graph (Multi-Provider)
 *
 * Both providers now run the FULL agentic pipeline:
 *   Planner → Agent (with tools) → Reflection → Summarize → Finalize
 *
 * 1. OPENAI GRAPH  (provider: "openai")
 *    Uses gpt-4o-mini via LangChain ChatOpenAI.
 *    Tool calling: native OpenAI function calling.
 *
 * 2. SARVAM GRAPH  (provider: "sarvam")
 *    Uses sarvam-m via LangChain ChatOpenAI pointed at Sarvam's OpenAI-compatible endpoint.
 *    Tool calling: sarvam-m supports the OpenAI tools parameter via /v1/chat/completions.
 *    ✅ Full tool support: create_task, update_task, create_schedule, web_search, etc.
 *    ✅ Indian language responses with full agentic capabilities.
 *
 * Auth difference:
 *    OpenAI: Authorization: Bearer <key>
 *    Sarvam: api-subscription-key: <key>  (also accepts Bearer as fallback)
 *    We send both headers so LangChain's OpenAI adapter works transparently.
 *
 * Provider is selected per-request based on user.aiProvider from the DB.
 */

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

// ─────────────────────────────────────────────────────────────
// GRAPH CACHE
// Compiled graphs are expensive to build — cache by key.
// Keys: "openai" | "openai-stream" | "sarvam" | "sarvam-stream"
// ─────────────────────────────────────────────────────────────
const graphCache = new Map();

// ─────────────────────────────────────────────────────────────
// MODEL FACTORIES
// ─────────────────────────────────────────────────────────────

/**
 * Builds a ChatOpenAI instance for the OpenAI provider.
 */
const buildOpenAIModel = (streaming = false) =>
    new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming,
    });

/**
 * Builds a ChatOpenAI instance pointed at Sarvam's OpenAI-compatible endpoint.
 *
 * sarvam-m's /v1/chat/completions is fully OpenAI-compatible, including the
 * `tools` parameter for function/tool calling. By routing through LangChain's
 * ChatOpenAI adapter we get the full agentic pipeline for free.
 *
 * Auth: Sarvam's primary auth is `api-subscription-key` header.
 * We also pass the key as the Bearer token (LangChain sends it automatically)
 * since Sarvam's API accepts it when the subscription key is also present.
 */
const buildSarvamModel = (streaming = false) =>
    new ChatOpenAI({
        model: "sarvam-m",
        temperature: 0.2,
        // LangChain sends this as "Authorization: Bearer <apiKey>"
        // Sarvam accepts it alongside the api-subscription-key header
        apiKey: process.env.SARVAM_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming,
        configuration: {
            // Point to Sarvam's OpenAI-compatible base URL
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            // Sarvam's primary auth mechanism
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY,
            },
        },
    });

// ─────────────────────────────────────────────────────────────
// AGENTIC GRAPH COMPILER (shared between OpenAI and Sarvam)
// Planner → Agent (tools) → Reflection → Summarize → Finalize
// ─────────────────────────────────────────────────────────────

/**
 * Compiles the full agentic graph for a given model.
 * Both OpenAI and Sarvam use this same pipeline — the only difference
 * is which model instance is passed in.
 *
 * @param {ChatOpenAI} model - Pre-built model instance (OpenAI or Sarvam)
 * @returns {CompiledGraph}
 */
const compileAgentGraph = (model) => {
    const tools = getBoundTools();
    const boundModel = model.bindTools(tools);

    const workflow = new StateGraph({ channels: graphState })
        .addNode("planner", createPlannerNode(boundModel))
        .addNode("agent", createIntentNode(boundModel))
        .addNode("tools", createToolNode(tools))
        .addNode("reflection", createReflectionNode(boundModel))
        .addNode("summarize", createMemoryNode(boundModel))
        .addNode("finalize", createFinalizeNode())
        .addEdge(START, "planner")
        .addEdge("planner", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "reflection")
        .addEdge("reflection", "agent")
        .addEdge("summarize", "finalize")
        .addEdge("finalize", END);

    return workflow.compile();
};

/**
 * Returns a cached compiled graph for the given provider + streaming mode.
 *
 * @param {string}  provider  - "openai" | "sarvam"
 * @param {boolean} streaming - Whether to build with streaming enabled
 * @returns {CompiledGraph}
 */
const getGraph = (provider, streaming = false) => {
    const cacheKey = `${provider}-${streaming ? "stream" : "sync"}`;

    if (!graphCache.has(cacheKey)) {
        // Safety eviction: prevent unbounded growth in long-running processes
        if (graphCache.size > 20) graphCache.clear();

        const model =
            provider === "sarvam"
                ? buildSarvamModel(streaming)
                : buildOpenAIModel(streaming);

        graphCache.set(cacheKey, compileAgentGraph(model));
    }

    return graphCache.get(cacheKey);
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API — runAgentGraph (non-streaming)
// ─────────────────────────────────────────────────────────────

/**
 * Runs the AI graph and returns the final AIMessage.
 * Both OpenAI and Sarvam run the full agentic pipeline.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {Array}  params.messages        - LangChain message objects
 * @param {Object} params.user            - Full Prisma user record
 * @param {string} params.conversationId
 * @param {string} params.provider        - "openai" | "sarvam" (default: "openai")
 * @returns {Promise<AIMessage>}
 */
export const runAgentGraph = async ({
    userId,
    messages,
    user,
    conversationId,
    provider = "openai",
}) => {
    const app = getGraph(provider, false);

    const finalState = await app.invoke(
        { messages },
        { configurable: { user, userId, conversationId } }
    );

    return finalState.messages[finalState.messages.length - 1];
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API — streamAgentGraph (streaming)
// ─────────────────────────────────────────────────────────────

/**
 * Streams AI response tokens via LangGraph streamEvents.
 * Both OpenAI and Sarvam stream through the full agentic pipeline.
 *
 * @param {Object} params - Same as runAgentGraph
 * @yields {string} Token chunks as they arrive
 */
export const streamAgentGraph = async function* ({
    userId,
    messages,
    user,
    conversationId,
    provider = "openai",
}) {
    const app = getGraph(provider, true);

    const stream = await app.streamEvents(
        { messages },
        {
            configurable: { user, userId, conversationId },
            version: "v1",
        }
    );

    for await (const event of stream) {
        if (event.event === "on_chat_model_stream") {
            const chunk = event.data?.chunk;
            if (chunk?.content) yield chunk.content;
        }
    }
};