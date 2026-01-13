import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../utils/ApiError.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateResponse = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "AI service not configured (Missing API Key)");
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new ApiError(502, "Failed to generate AI response");
    }
};
