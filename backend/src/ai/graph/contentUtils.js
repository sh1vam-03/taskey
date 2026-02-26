/**
 * Content Normalization Utility
 *
 * LangChain messages (especially from Gemini) return `.content` as either:
 *   - string   → plain text response
 *   - Array    → multipart content: [{ type: "text", text: "..." }, ...]
 *   - null     → empty system/planner injections
 *
 * All graph nodes MUST normalize before calling string methods (.toLowerCase,
 * .includes, .length, etc.) to avoid TypeErrors and silent wrong behavior.
 *
 * Usage:
 *   import { normalizeContent } from "../contentUtils.js";
 *   const text = normalizeContent(message.content);
 */

/**
 * Converts any LangChain message content value to a plain string.
 *
 * @param {string|Array|null|undefined} content
 * @returns {string}
 */
export const normalizeContent = (content) => {
    if (typeof content === "string") return content;

    if (Array.isArray(content)) {
        // Extract text from each content part (handles Gemini multipart responses)
        return content
            .map(part => {
                if (typeof part === "string") return part;
                // Standard LangChain content part: { type: "text", text: "..." }
                if (part?.text) return part.text;
                // Fallback for other part types (image_url, tool_use, etc.)
                return "";
            })
            .filter(Boolean)
            .join("");
    }

    // null, undefined, or unexpected type → empty string
    return "";
};