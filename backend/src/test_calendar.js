import prisma from "./config/db.js";
import { listSchedulesTool } from "./ai/tools/schedule.tool.js";

async function test() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user found");

    console.log("Mocking AI execution of `list_schedules` tool for next week...");

    const tool = listSchedulesTool();
    const result = await tool.func(
        { from: "2026-03-01", to: "2026-03-07" },
        { configurable: { userId: user.id } }
    );

    console.log("\n==================== TOOL RESPONSE ====================");
    console.log(JSON.stringify(JSON.parse(result), null, 2));
    console.log("=======================================================\n");
}

test().catch(console.error).finally(() => process.exit(0));
