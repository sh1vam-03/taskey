import { StateGraph, END, START } from "@langchain/langgraph";
import { sarvamState } from "./schema.js";
import {
    createIntentExtractorNode,
    validateIntentNode,
    actionExecutorNode,
    createResponseGeneratorNode
} from "./nodes.js";

/**
 * Conditional edge to decide if we should execute an action or
 * if it was an UNKNOWN/conversational intent that should just get a response.
 */
const shouldExecuteAction = (state) => {
    const intent = state.parsedIntent;

    // If validation failed or it's just a chat, skip execution
    if (!intent || intent.action === "UNKNOWN" || state.routingError) {
        return "response";
    }

    return "execute";
};

/**
 * Compiles the custom manual routing graph for Sarvam.
 *
 * START -> extractor -> validator -> [conditional] -> executor -> response -> END
 *                                                  -> response -> END
 */
export const compileSarvamGraph = (model) => {
    const workflow = new StateGraph({ channels: sarvamState })
        .addNode("extractor", createIntentExtractorNode(model))
        .addNode("validator", validateIntentNode)
        .addNode("executor", actionExecutorNode)
        .addNode("response", createResponseGeneratorNode(model))

        // Define edges
        .addEdge(START, "extractor")
        .addEdge("extractor", "validator")
        .addConditionalEdges("validator", shouldExecuteAction, {
            execute: "executor",
            response: "response" // bypass executor
        })
        .addEdge("executor", "response")
        .addEdge("response", END);

    return workflow.compile();
};
