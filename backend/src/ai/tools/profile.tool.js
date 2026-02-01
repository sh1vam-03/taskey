// User profile & preferences

import prisma from "../../config/db.js";

export async function getProfileTool(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            timezone: true,
            plan: true,
            createdAt: true,
        },
    });
}
