// Read behavior logs

import prisma from "../../config/db.js";

export async function getRecentBehaviorTool(userId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.behaviorLog.findMany({
        where: {
            userId,
            date: { gte: since },
        },
        orderBy: { date: "desc" },
    });
}
