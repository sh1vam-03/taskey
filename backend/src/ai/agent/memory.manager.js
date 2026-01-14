// Short & long term memory logic

import prisma from "../../config/db.js";

/**
 * Memory Manager
 * ----------------
 * Converts raw user data into meaningful AI memory
 * Keeps memory small, useful, and human-like
 */

export const memoryManager = {
    /**
     * Build memory snapshot for agent
     * Used BEFORE calling the AI
     */
    async getAgentMemory(userId) {
        // Last 7 days behavior
        const behaviors = await prisma.behaviorLog.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 7,
        });

        // Missed schedules (last 7 days)
        const missed = await prisma.missedSchedule.findMany({
            where: { userId },
            orderBy: { missedOn: "desc" },
            take: 10,
        });

        // Task completion trend
        const completions = await prisma.taskDailyCompletion.findMany({
            where: { userId },
            orderBy: { completedDate: "desc" },
            take: 14,
        });

        return {
            habits: extractHabits(behaviors),
            productivity: extractProductivity(completions),
            risks: extractRisks(missed, behaviors),
        };
    },

    /**
     * Store memory insight AFTER AI action
     * Example: "User ignored breaks", "User prefers mornings"
     */
    async storeInsight(userId, insight) {
        if (!insight) return;

        await prisma.aiUsage.create({
            data: {
                userId,
                type: "CHAT",
                tokensUsed: 0,
            },
        });

        // (Optional) store insights table later if needed
    },
};

/* ───────────────────────── HELPERS ───────────────────────── */

function extractHabits(behaviors = []) {
    if (!behaviors.length) return "No consistent habits detected yet.";

    const sleepLow = behaviors.filter(b => b.sleepHours && b.sleepHours < 6).length;
    const exercised = behaviors.filter(b => b.exercise).length;

    return {
        averageSleep: avg(
            behaviors.map(b => b.sleepHours).filter(Boolean)
        ),
        oftenLowSleep: sleepLow >= 3,
        exerciseFrequency: exercised,
    };
}

function extractProductivity(completions = []) {
    if (!completions.length) return "Not enough data.";

    return {
        recentCompletions: completions.length,
        consistency: completions.length >= 8 ? "GOOD" : "LOW",
    };
}

function extractRisks(missed = [], behaviors = []) {
    const missedCount = missed.length;

    const lateNights =
        behaviors.filter(b => b.sleepHours && b.sleepHours < 5).length >= 2;

    return {
        missedSchedules: missedCount,
        burnoutRisk: missedCount > 5 || lateNights,
    };
}

function avg(nums = []) {
    if (!nums.length) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
