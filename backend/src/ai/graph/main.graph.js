/**
 * Main Agent Graph (Multi-Model)
 *
 * All three LLM backends run the IDENTICAL full agentic pipeline:
 *   Planner → Agent (with tools) → Reflection → Summarize → Finalize
 *
 * Supported chat/voice model IDs:
 *   "gemini-1.5-flash" → LangChain ChatGoogleGenerativeAI (DEFAULT)
 *   "sarvam-30b"       → LangChain ChatOpenAI @ Sarvam OpenAI-compatible endpoint
 *   "gpt-4o-mini"      → LangChain ChatOpenAI @ OpenAI
 *
 * Provider is now decoupled from voice/STT/TTS — the graph only cares about
 * which LLM model to use for reasoning. STT/TTS routing is handled separately
 * in voice/stt.service.js and voice/tts.service.js.
 *
 * Graph cache key: "<modelId>-sync" or "<modelId>-stream"
 * e.g. "gemini-1.5-flash-sync", "sarvam-30b-stream"
 *
 * Requires: npm install @langchain/google-genai
 */

import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
// Compiled graphs are expensive — cache by modelId + streaming mode.
// Keys: "gemini-1.5-flash-sync" | "gemini-1.5-flash-stream"
//       "sarvam-30b-sync"       | "sarvam-30b-stream"
//       "gpt-4o-mini-sync"      | "gpt-4o-mini-stream"
// ─────────────────────────────────────────────────────────────
const graphCache = new Map();

// ─────────────────────────────────────────────────────────────
// MODEL FACTORIES
// ─────────────────────────────────────────────────────────────

/**
 * Google Gemini 1.5 Flash via LangChain's ChatGoogleGenerativeAI adapter.
 * Supports full tool calling and streaming natively.
 */
const buildGeminiModel = (streaming = false) =>
    new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0,
        streaming,
        maxRetries: 2,
        apiVersion: "v1beta",
    });

/**
 * Sarvam 30B via LangChain's ChatOpenAI adapter pointed at Sarvam's
 * OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Auth: Sarvam uses api-subscription-key header.
 * We also pass the key as apiKey so LangChain sends it as Bearer — Sarvam
 * accepts it alongside the api-subscription-key header.
 */
const buildSarvamModel = (streaming = false) =>
    new ChatOpenAI({
        model: "sarvam-30b",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming,
        configuration: {
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY
            }
        }
    });

/**
 * Sarvam-M via LangChain's ChatOpenAI adapter.
 * Uses the same endpoint but model identifier is sarvam-m.
 */
const buildSarvamMModel = (streaming = false) =>
    new ChatOpenAI({
        model: "sarvam-m",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming,
        configuration: {
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY
            }
        }
    });

/**
 * OpenAI GPT-4o Mini — standard LangChain ChatOpenAI adapter.
 */
const buildOpenAIModel = (streaming = false) =>
    new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2,
        streaming
    });

/**
 * Returns the correct LangChain model instance for a given model ID.
 * Falls back to Gemini if an unknown ID is passed.
 *
 * @param {string} modelId - "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini"
 * @param {boolean} streaming
 * @returns {BaseChatModel}
 */
const buildModel = (modelId, streaming = false) => {
    switch (modelId) {
        case "gemini-2.0-flash": return buildGeminiModel(streaming);
        case "gemini-1.5-flash": return buildGeminiModel(streaming); // Fallback
        case "sarvam-30b": return buildSarvamModel(streaming);
        case "sarvam-m": return buildSarvamMModel(streaming);
        case "gpt-4o-mini": return buildOpenAIModel(streaming);
        default:
            console.warn(`[Graph] Unknown modelId "${modelId}" — falling back to Gemini 1.5 Flash`);
            return buildGeminiModel(streaming);
    }
};

// ─────────────────────────────────────────────────────────────
// AGENTIC GRAPH COMPILER
// Identical pipeline for all three models.
// Planner → Agent (tools) → Reflection → Summarize → Finalize
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// CHAT-ONLY GRAPH COMPILER
// For models that do not support tool calling (like sarvam-m)
// START → Agent → Summarize → Finalize → END
// ─────────────────────────────────────────────────────────────

const compileChatOnlyGraph = (model) => {
    const workflow = new StateGraph({ channels: graphState })
        .addNode("agent", createIntentNode(model)) // No bound tools
        .addNode("summarize", createMemoryNode(model))
        .addNode("finalize", createFinalizeNode())
        .addEdge(START, "agent")
        .addEdge("agent", "summarize")
        .addEdge("summarize", "finalize")
        .addEdge("finalize", END);

    return workflow.compile();
};

/**
 * Returns a cached compiled graph for the given model ID + streaming mode.
 *
 * @param {string}  modelId   - "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini"
 * @param {boolean} streaming
 * @returns {CompiledGraph}
 */
const getGraph = (modelId, streaming = false) => {
    const cacheKey = `${modelId}-${streaming ? "stream" : "sync"}`;

    if (!graphCache.has(cacheKey)) {
        if (graphCache.size > 20) graphCache.clear(); // safety eviction

        const model = buildModel(modelId, streaming);
        const compiledGraph = modelId === "sarvam-m" ? compileChatOnlyGraph(model) : compileAgentGraph(model);

        graphCache.set(cacheKey, compiledGraph);
    }

    return graphCache.get(cacheKey);
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API — runAgentGraph (non-streaming)
// ─────────────────────────────────────────────────────────────

/**
 * Runs the full agentic graph and returns the final AIMessage.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {Array}  params.messages        - LangChain message objects
 * @param {Object} params.user            - Full Prisma user record
 * @param {string} params.conversationId
 * @param {string} params.chatModel       - "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini"
 * @returns {Promise<AIMessage>}
 */
export const runAgentGraph = async ({
    userId,
    messages,
    user,
    conversationId,
    chatModel = "gemini-1.5-flash"
}) => {
    const app = getGraph(chatModel, false);

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
 *
 * @param {Object} params - Same as runAgentGraph
 * @yields {string} Token chunks as they arrive
 */
export const streamAgentGraph = async function* ({
    userId,
    messages,
    user,
    conversationId,
    chatModel = "gemini-1.5-flash"
}) {
    const app = getGraph(chatModel, true);

    const stream = await app.streamEvents(
        { messages },
        {
            configurable: { user, userId, conversationId },
            version: "v1"
        }
    );

    for await (const event of stream) {
        if (event.event === "on_chat_model_stream" || event.event === "on_llm_stream") {
            // Only yield tokens that originated from the main agent intent node
            if (event.tags && event.tags.includes("agent_llm")) {
                const chunk = event.data?.chunk;
                const content = chunk?.content || chunk?.message?.content || chunk?.text;
                if (content) yield content;
            }
        }
    }
};