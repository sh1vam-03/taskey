import { processAiRequestStream } from "./ai/services/aiOrchestrator.service.js";
import dotenv from "dotenv";

dotenv.config();

const conversationId = "ec46ab3f-680a-4067-b365-da8bba16753a";
const userId = "cm6nssxow0000rsk0a0ikmbqj"; // l1acker03@gmail.com user id wait let me get it using Prisma first

import prisma from "./config/db.js";

async function test() {
    const conv = await prisma.aiConversation.findUnique({
        where: { id: conversationId }
    });

    if (!conv) {
        console.log("Conversation not found!");
        return;
    }

    console.log(`Running stream for User: ${conv.userId}, Conv: ${conv.id}`);

    try {
        const stream = processAiRequestStream({
            userId: conv.userId,
            conversationId: conv.id,
            message: "This is a test message to trigger the 400 error.",
            mode: "TEXT"
        });

        for await (const chunk of stream) {
            console.log("Chunk:", chunk);
        }
    } catch (e) {
        console.warn("Caught top level error:", e.message);
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());
