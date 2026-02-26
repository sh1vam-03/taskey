import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0,
        streaming: true
    });

    const stream = await model.stream("Tell me a long story about a cat.");
    let start = Date.now();
    for await (const chunk of stream) {
        console.log(`[${Date.now() - start}ms] Chunk:`, chunk.content.substring(0, 30));
    }
}
test();
