import { processAiRequestStream } from "./ai/services/aiOrchestrator.service.js";
import prisma from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    console.log("Simulating processAiRequestStream...");
    try {
        // Find or create a test user
        let user = await prisma.user.findFirst({ where: { email: "test@example.com" } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123",
                    plan: "FREE",
                    subscriptionCredits: 1000
                }
            });
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { subscriptionCredits: 1000 }
            });
        }

        // Create a conversation
        const conversation = await prisma.aiConversation.create({
            data: {
                userId: user.id,
                title: "Test Conversation"
            }
        });

        const stream = processAiRequestStream({
            userId: user.id,
            conversationId: conversation.id,
            message: "Hello",
            mode: "TEXT"
        });

        for await (const chunk of stream) {
            console.log("Chunk:", chunk);
        }
        console.log("Test finished successfully.");
    } catch (e) {
        console.log("ERROR STATUS:", e.statusCode);
        console.log("ERROR MESSAGE:", e.message);
        console.log("ERROR STACK:", e.stack);
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());
