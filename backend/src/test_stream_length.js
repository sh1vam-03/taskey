import dotenv from "dotenv";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

async function testLongStream() {
    const model = new ChatOpenAI({
        model: "sarvam-30b",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY,
        maxTokens: 2048,
        streaming: true,
        configuration: {
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY
            }
        }
    });

    console.log("Asking for a very long response to test truncation...");
    const stream = await model.stream([
        new HumanMessage("Please write a detailed essay about the history of artificial intelligence. Write at least 800 words, formatting with bullet points, numbered lists, and multiple paragraphs.")
    ]);

    let fullText = "";
    let chunkCount = 0;
    for await (const chunk of stream) {
        fullText += chunk.content;
        chunkCount++;
        process.stdout.write(chunk.content);
    }

    console.log(`\n\n--- DONE ---`);
    console.log(`Total Chunks received: ${chunkCount}`);
    console.log(`Total Length: ${fullText.length} characters`);
}

testLongStream().catch(console.error);
