import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

async function test() {
    const model = new ChatOpenAI({
        model: "sarvam-m",
        temperature: 0.2,
        apiKey: process.env.SARVAM_API_KEY,
        configuration: {
            baseURL: `${process.env.SARVAM_API_BASE || "https://api.sarvam.ai"}/v1`,
            defaultHeaders: {
                "api-subscription-key": process.env.SARVAM_API_KEY
            }
        }
    });

    console.log("Testing [System, Human, AI, Human]...");
    try {
        await model.invoke([
            new SystemMessage("You are a helpful assistant."),
            new HumanMessage("Hello"),
            new AIMessage("Hi there!"),
            new HumanMessage("How are you?")
        ]);
        console.log("SUCCESS: [System, Human, AI, Human] is supported.");
    } catch (e) {
        console.log("ERROR:", e.message);
    }
}
test().catch(console.error);
