import prisma from "./config/db.js";

async function test() {
    console.log("Looking for tasks 'Rask' and 'Game Baba'...");
    const tasks = await prisma.task.findMany({
        where: { title: { contains: "Game Baba" } },
        include: { schedules: true }
    });

    console.log("Game Baba:");
    console.log(JSON.stringify(tasks, null, 2));

    const rask = await prisma.task.findMany({
        where: { title: { contains: "Rask" } },
        include: { schedules: true }
    });

    console.log("\nThis is Rask:");
    console.log(JSON.stringify(rask, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
