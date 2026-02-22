/**
 * Main Agent Graph (Multi-Provider)
 *
 * Two graph variants:
 *
 * 1. OPENAI GRAPH  (provider: "openai")
 *    Full agentic flow: Planner → Agent (with tools) → Reflection → Finalize
 *    Uses gpt-4o-mini. Supports tool calling, web search, tasks, schedules.
 *
 * 2. SARVAM GRAPH  (provider: "sarvam")
 *    Simplified conversational flow: Context → sarvam-m → Finalize
 *    ⚠️  sarvam-m does NOT support tool calling.
 *    Best for: Indian language chat, conversational Q&A, simple planning advice.
 *    Tool actions (create_task, schedule, etc.) will NOT be executed — user gets
 *    a text response instead. For full tool support, switch to OpenAI provider.
 *
 * The provider is selected per-request based on user preferences (user.aiProvider).
 */

import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { graphState } from "./state.schema.js";

import { createIntentNode } from "./nodes/intent.node.js";
import { createToolNode, getBoundTools } from "./nodes/tool.node.js";
import { createMemoryNode } from "./nodes/memory.node.js";
import { createPlannerNode } from "./nodes/planner.node.js";
import { createReflectionNode } from "./nodes/reflection.node.js";
import { createFinalizeNode } from "./nodes/finalize.node.js";
import { shouldContinue } from "./edges.js";

import { buildSystemContext } from "../services/aiContext.service.js";
import { sarvamChat, sarvamChatStream } from "../services/sarvam.service.js";

// ─────────────────────────────────────────────────────────────
// GRAPH CACHE
// Key: "openai" | "sarvam"
// ─────────────────────────────────────────────────────────────
const graphCache = new Map();

// ─────────────────────────────────────────────────────────────
// HELPERS — Model factories
// ─────────────────────────────────────────────────────────────

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
 * Builds a ChatOpenAI pointed at Sarvam's OpenAI-compatible endpoint.
 * Sends BOTH api-subscription-key (required) and Authorization: Bearer (ignored).
 * sarvam-m does not support .bindTools(), so do NOT call .bindTools() on this model.
 */
const buildSarvamModel = (streaming = false) =>
    new ChatOpenAI({
        model: "sarvam-m",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY || "sarvam-key", // value used as Bearer token
        configuration: {
            baseURL: "https://api.sarvam.ai/v1",
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY,
            },
        },
        timeout: 30000,
        maxRetries: 2,
        streaming,
    });

// ─────────────────────────────────────────────────────────────
// OPENAI AGENTIC GRAPH
// Full: Planner → Agent (tools) → Reflection → Summarize → Finalize
// ─────────────────────────────────────────────────────────────

const compileOpenAIGraph = (streaming = false) => {
    const tools = getBoundTools();
    const model = buildOpenAIModel(streaming).bindTools(tools);

    const workflow = new StateGraph({ channels: graphState })
        .addNode("planner", createPlannerNode(model))
        .addNode("agent", createIntentNode(model))
        .addNode("tools", createToolNode(tools))
        .addNode("reflection", createReflectionNode(model))
        .addNode("summarize", createMemoryNode(model))
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
// SARVAM CONVERSATIONAL GRAPH
// Simplified: Context Inject → sarvam-m chat → Finalize
// No tools, no planner. Pure conversation.
// ─────────────────────────────────────────────────────────────

const compileSarvamGraph = () => {
    const model = buildSarvamModel(false);

    /**
     * Single node: builds system context + invokes sarvam-m directly.
     * Converts LangChain messages to Sarvam-compatible format.
     */
    const sarvamChatNode = async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        // Build context-rich system prompt (same as OpenAI graph)
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);

        // Convert LangChain messages to plain {role, content} format
        const plainMessages = messages.map((msg) => {
            if (msg._getType?.() === "human" || msg.role === "user") {
                return { role: "user", content: msg.content };
            }
            if (msg._getType?.() === "ai" || msg.role === "assistant") {
                return { role: "assistant", content: msg.content };
            }
            if (msg._getType?.() === "system" || msg.role === "system") {
                return { role: "system", content: msg.content };
            }
            return { role: "user", content: String(msg.content) };
        });

        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...plainMessages,
        ];

        const responseText = await sarvamChat(fullMessages, {
            temperature: 0.2,
            maxTokens: 2048,
        });

        return { messages: [new AIMessage(responseText)] };
    };

    const workflow = new StateGraph({ channels: graphState })
        .addNode("sarvam_chat", sarvamChatNode)
        .addNode("finalize", createFinalizeNode())
        .addEdge(START, "sarvam_chat")
        .addEdge("sarvam_chat", "finalize")
        .addEdge("finalize", END);

    return workflow.compile();
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API — runAgentGraph
// ─────────────────────────────────────────────────────────────

/**
 * Runs the AI graph and returns the final AIMessage.
 * Automatically routes to the correct graph based on provider.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {Array}  params.messages  - LangChain message objects
 * @param {Object} params.user      - Full user object from DB
 * @param {string} params.conversationId
 * @param {string} params.provider  - "openai" | "sarvam" (default: "openai")
 */
export const runAgentGraph = async ({
    userId,
    messages,
    user,
    conversationId,
    provider = "openai",
}) => {
    const cacheKey = provider === "sarvam" ? "sarvam" : "openai";

    // Get or compile graph
    if (!graphCache.has(cacheKey)) {
        if (graphCache.size > 20) graphCache.clear(); // safety eviction

        const app =
            cacheKey === "sarvam"
                ? compileSarvamGraph()
                : compileOpenAIGraph(false);

        graphCache.set(cacheKey, app);
    }

    const app = graphCache.get(cacheKey);

    const finalState = await app.invoke(
        { messages },
        { configurable: { user, userId, conversationId } }
    );

    return finalState.messages[finalState.messages.length - 1];
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API — streamAgentGraph
// ─────────────────────────────────────────────────────────────

/**
 * Streams AI response tokens.
 * For OpenAI: uses LangGraph streamEvents.
 * For Sarvam: uses sarvamChatStream directly (simpler SSE).
 *
 * @param {Object} params - Same as runAgentGraph
 * @yields {string} Token chunks
 */
export const streamAgentGraph = async function* ({
    userId,
    messages,
    user,
    conversationId,
    provider = "openai",
}) {
    // ── Sarvam streaming path ────────────────────────────────
    if (provider === "sarvam") {
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);

        const plainMessages = messages.map((msg) => {
            if (msg._getType?.() === "human" || msg.role === "user") {
                return { role: "user", content: msg.content };
            }
            if (msg._getType?.() === "ai" || msg.role === "assistant") {
                return { role: "assistant", content: msg.content };
            }
            return { role: "user", content: String(msg.content) };
        });

        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...plainMessages,
        ];

        yield* sarvamChatStream(fullMessages, { temperature: 0.2, maxTokens: 2048 });
        return;
    }

    // ── OpenAI streaming path ────────────────────────────────
    const cacheKey = "openai-stream";
    if (!graphCache.has(cacheKey)) {
        if (graphCache.size > 20) graphCache.clear();
        graphCache.set(cacheKey, compileOpenAIGraph(true));
    }
    const app = graphCache.get(cacheKey);

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