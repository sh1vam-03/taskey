import prisma from "../../config/db.js";

/**
 * Behavior Memory
 * Fetches long-term behavior stats for context injection
 */
export const getRecentBehaviors = async (userId, limit = 3) => {
    try {
        const logs = await prisma.behaviorLog.findMany({
            where: { userId },
            take: limit,
            orderBy: { date: 'desc' },
            select: { date: true, mood: true, sleepHours: true, notes: true }
        });
        return logs;
    } catch (e) {
        console.error("Behavior Fetch Error", e);
        return [];
    }
};

export const formatBehaviorContext = (logs) => {
    if (!logs.length) return "";
    return "\nRecent Behavior Logs:\n" + logs.map(l =>
        `- ${l.date.toISOString().split('T')[0]}: Mood=${l.mood}, Sleep=${l.sleepHours}h, Notes=${l.notes || 'none'}`
    ).join("\n");
};
