/**
 * Main Agent Graph (Multi-Provider)
 *
 * Two graph variants:
 *
 * 1. OPENAI GRAPH  (provider: "openai")
 *    Full agentic flow: Planner → Agent (with tools) → Reflection → Summarize → Finalize
 *    Uses gpt-4o-mini. Supports tool calling, web search, tasks, schedules.
 *
 * 2. SARVAM GRAPH  (provider: "sarvam")
 *    Simplified conversational flow: sarvam_chat → Finalize
 *    ⚠️  sarvam-m does NOT support tool calling.
 *    Best for Indian language chat, conversational Q&A, simple planning.
 *    Tool actions (create_task, schedule, etc.) will NOT be executed.
 *    For full tool support, switch to the OpenAI provider.
 *
 * Provider is selected per-request based on user.aiProvider from the DB.
 */

import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";  // HumanMessage / SystemMessage not used here
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
// Compiled graphs are expensive to build — cache by key.
// Keys: "openai" | "openai-stream" | "sarvam"
// ─────────────────────────────────────────────────────────────
const graphCache = new Map();

// ─────────────────────────────────────────────────────────────
// MODEL FACTORY — OpenAI only
// Sarvam graph calls sarvam.service.js directly (no LangChain model needed).
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

// ─────────────────────────────────────────────────────────────
// OPENAI AGENTIC GRAPH
// Planner → Agent (tools) → Reflection → Summarize → Finalize
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
// sarvam_chat → Finalize
// No tools, no planner — pure conversation via sarvam.service.js.
// ─────────────────────────────────────────────────────────────

const compileSarvamGraph = () => {
    /**
     * Single node: injects system context + calls sarvam-m directly.
     * Does NOT use a LangChain model instance — sarvam-m is called through
     * our own sarvam.service.js adapter (which handles auth correctly).
     */
    const sarvamChatNode = async (state, config) => {
        const { messages } = state;
        const { user, conversationId } = config.configurable;

        // Build context-rich system prompt (same as OpenAI graph)
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);

        // Convert LangChain message objects to plain {role, content} format
        const plainMessages = messages.map((msg) => {
            const type = msg._getType?.();
            if (type === "human" || msg.role === "user")
                return { role: "user", content: msg.content };
            if (type === "ai" || msg.role === "assistant")
                return { role: "assistant", content: msg.content };
            if (type === "system" || msg.role === "system")
                return { role: "system", content: msg.content };
            // Fallback — treat unknown as user turn
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
// PUBLIC API — runAgentGraph (non-streaming)
// ─────────────────────────────────────────────────────────────

/**
 * Runs the AI graph and returns the final AIMessage.
 * Automatically routes to the correct graph based on provider.
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
    const cacheKey = provider === "sarvam" ? "sarvam" : "openai";

    if (!graphCache.has(cacheKey)) {
        // Safety eviction: prevent unbounded growth in long-running processes
        if (graphCache.size > 20) graphCache.clear();

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
// PUBLIC API — streamAgentGraph (streaming)
// ─────────────────────────────────────────────────────────────

/**
 * Streams AI response tokens.
 *   OpenAI: uses LangGraph streamEvents (full graph pipeline).
 *   Sarvam: uses sarvamChatStream directly (avoids unnecessary graph overhead).
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
    // ── Sarvam streaming ──────────────────────────────────────
    if (provider === "sarvam") {
        const systemPrompt = await buildSystemContext(user.id, user, conversationId);

        const plainMessages = messages.map((msg) => {
            const type = msg._getType?.();
            if (type === "human" || msg.role === "user")
                return { role: "user", content: msg.content };
            if (type === "ai" || msg.role === "assistant")
                return { role: "assistant", content: msg.content };
            return { role: "user", content: String(msg.content) };
        });

        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...plainMessages,
        ];

        yield* sarvamChatStream(fullMessages, { temperature: 0.2, maxTokens: 2048 });
        return;
    }

    // ── OpenAI streaming ──────────────────────────────────────
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