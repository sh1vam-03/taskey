import prisma from "./config/db.js";
import { getRangeCalendar } from "./services/calendar.service.js";

async function test() {
    console.log("Looking for task '454'...");
    const tasks = await prisma.task.findMany({
        where: { title: { contains: "454" } },
        include: { schedules: true }
    });

    console.log("Task '454' DB Record:");
    console.log(JSON.stringify(tasks, null, 2));

    if (tasks.length > 0) {
        const userId = tasks[0].userId;
        console.log(`\nRunning getRangeCalendar for user ${userId} for March 01 to March 07...`);
        const calendar = await getRangeCalendar(userId, "2026-03-01", "2026-03-07");
        console.log("\getRangeCalendar Output for March 1st:");
        console.log(JSON.stringify(calendar["2026-03-01"], null, 2));
    }
}

test().catch(console.error).finally(() => process.exit(0));
