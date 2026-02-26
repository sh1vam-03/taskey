import 'dotenv/config';
import { runAgentGraph } from '../ai/graph/main.graph.js';
import { HumanMessage } from "@langchain/core/messages";
import prisma from '../config/db.js';

async function test() {
    try {
        console.log("Testing AI Graph...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found in DB");
            return;
        }

        console.log("User found:", user.id);

        const res = await runAgentGraph({
            userId: user.id,
            messages: [new HumanMessage("Hello")],
            user: user,
            conversationId: "test-conv-id"
        });
        console.log("Result:", res);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
