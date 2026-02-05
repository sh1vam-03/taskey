import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

/**
 * Custom Tavily Search Tool
 * Robust implementation with fetch check and JSON output.
 */
export const createTavilyTool = (apiKey) => {
    return new DynamicStructuredTool({
        name: "web_search",
        description: "Search the internet for up-to-date information.",
        schema: z.object({
            query: z.string().describe("The search query"),
            max_results: z.number().optional().default(3),
        }),
        func: async ({ query, max_results }) => {
            if (!apiKey) {
                return error("TAVILY_API_KEY is not configured.");
            }

            // SAFETY CHECK (Fix 1: Deployment Bug)
            if (typeof globalThis.fetch !== 'function') {
                return error("Fetch API not available. Ensure Node >= 18.");
            }

            try {
                const response = await fetch("https://api.tavily.com/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        query,
                        max_results: max_results || 3,
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    return error(`Tavily API Error: ${response.status} - ${errText}`);
                }

                const data = await response.json();

                // Format results
                const results = data.results.map(r =>
                    `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content.slice(0, 500)}...`
                ).join("\n\n");

                return success({ results: results || "No results found." });

            } catch (e) {
                return error(`Search failed: ${e.message}`);
            }
        },
    });
};
