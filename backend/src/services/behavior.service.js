import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { buildDailyStatsMap } from "./dashboard.service.js";
import { getCurrentMonthYear, toUTCDateOnly, startOfUTCDate } from "../utils/date.utils.js";
import { calculateBehaviorScore, calculateProductivityScore } from "../utils/score.utils.js";

// Local date utils removed in favor of centralized date.utils.js

// toUTCDate removed

/* -------------------------------------------------------------------------- */
/*                           UPSERT (NO SCORE)                                 */
/* -------------------------------------------------------------------------- */

export const upsertBehaviorLog = async (userId, payload) => {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { date, mood, notes, sleepHours, exercise } = payload;

    if (!mood) throw new ApiError(400, "Mood is required");

    // Use toUTCDateOnly if date string provided, else startOfUTCDate for today
    const day = date ? toUTCDateOnly(date) : startOfUTCDate();
    if (!day) throw new ApiError(400, "Invalid date");

    const today = startOfUTCDate();
    const maxDate = new Date(today);
    maxDate.setUTCDate(today.getUTCDate() + 1); // Allow 1 day buffer for timezone differences

    if (day > maxDate) {
        throw new ApiError(400, "Future dates are not allowed");
    }

    // 1️⃣ Check if log already exists
    const existing = await prisma.behaviorLog.findUnique({
        where: {
            userId_date: { userId, date: day }
        }
    });

    const isNew = !existing;

    // Usage limit check is handled by the controller

    // 2️⃣ Upsert behavior
    const behavior = await prisma.behaviorLog.upsert({
        where: {
            userId_date: { userId, date: day }
        },
        update: {
            mood,
            notes,
            sleepHours,
            exercise
        },
        create: {
            userId,
            date: day,
            mood,
            notes,
            sleepHours,
            exercise
        }
    });

    // Usage increment is handled by the controller via incrementUsage()
    return { ...behavior, isNew };
};


/* -------------------------------------------------------------------------- */
/*                         GET LATEST BEHAVIOR                                 */
/* -------------------------------------------------------------------------- */

export const getLatestBehaviorLog = async (userId) => {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const behavior = await prisma.behaviorLog.findFirst({
        where: { userId },
        orderBy: { date: "desc" }
    });

    return behavior;
};

/* -------------------------------------------------------------------------- */
/*                         GET BEHAVIOR BY DATE                                */
/* -------------------------------------------------------------------------- */

export const getBehaviorLogByDate = async (userId, date) => {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const day = toUTCDateOnly(date);
    if (!day) throw new ApiError(400, "Invalid date");

    const behavior = await prisma.behaviorLog.findUnique({
        where: {
            userId_date: { userId, date: day }
        }
    });

    if (!behavior) return null;

    const statsMap = await buildDailyStatsMap(userId, day, day);
    const key = day.toISOString().slice(0, 10);

    const stats = statsMap[key] ?? {
        total: 0,
        completed: 0,
        missed: 0
    };

    return {
        ...behavior,
        behaviorScore: calculateBehaviorScore({
            sleepHours: behavior.sleepHours,
            exercise: behavior.exercise,
            mood: behavior.mood
        }),
        productivityScore: calculateProductivityScore({
            ...stats,
            sleepHours: behavior.sleepHours,
            exercise: behavior.exercise,
            mood: behavior.mood,
            behaviorScore: calculateBehaviorScore({
                sleepHours: behavior.sleepHours,
                exercise: behavior.exercise,
                mood: behavior.mood
            })
        })
    };
};

/* -------------------------------------------------------------------------- */
/*                           BEHAVIOR SUMMARY                                  */
/* -------------------------------------------------------------------------- */

export const getBehaviorSummary = async (userId, days = 7) => {
    if (!userId) throw new ApiError(401, "Unauthorized");
    if (days < 1 || days > 90) {
        throw new ApiError(400, "Days must be between 1 and 90");
    }

    // End date includes tomorrow (buffer for timezone)
    const end = startOfUTCDate();
    end.setUTCDate(end.getUTCDate() + 1);

    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - (days - 1));

    const logs = await prisma.behaviorLog.findMany({
        where: {
            userId,
            date: { gte: start, lte: end }
        },
        orderBy: { date: "asc" }
    });

    if (!logs.length) {
        return {
            avgProductivity: 0,
            moodDistribution: {},
            daysLogged: 0,
            history: [] // Add empty history
        };
    }

    let totalScore = 0;
    const moodDistribution = {};
    const history = [];

    // Create a map of existing logs for quick lookup
    const logsMap = new Map();
    logs.forEach(log => {
        logsMap.set(log.date.toISOString().slice(0, 10), log);
    });

    // Iterate through EACH day in the range to build history (filling gaps)
    const loopDate = new Date(start);
    while (loopDate <= end) {
        const key = loopDate.toISOString().slice(0, 10);
        const dayDate = new Date(loopDate);
        const log = logsMap.get(key);

        let behaviorScore = 0;
        let productivityScore = 0;

        if (log) {
            // Calculate score for existing log
            const statsMap = await buildDailyStatsMap(userId, dayDate, dayDate);
            const stats = statsMap[key] ?? { total: 0, completed: 0, missed: 0 };

            const bScore = calculateBehaviorScore({
                sleepHours: log.sleepHours,
                exercise: log.exercise,
                mood: log.mood
            });

            const pScore = calculateProductivityScore({
                ...stats,
                behaviorScore: bScore
            });

            behaviorScore = bScore;
            productivityScore = pScore;

            // Accumulate metadata for summary stats only from existing logs
            totalScore += pScore; // Keep average based on productivity? Or behavior? Let's keep productivity for "Average Productivity" if usage implies.
            // Actually, if the user wants "Behavior Score" focus, maybe average should be behavior?
            // "avgProductivity" is the return key.
            // I'll keep totalScore as productivity for now to minimize breakage, but I will return both in history.
            moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
        }

        history.push({
            date: key,
            behaviorScore,
            productivityScore,
            score: productivityScore // Fallback
        });

        loopDate.setUTCDate(loopDate.getUTCDate() + 1);
    }

    return {
        avgProductivity: logs.length > 0 ? Math.round(totalScore / logs.length) : 0,
        moodDistribution,
        daysLogged: logs.length,
        history
    };
};


/**
 * Explain why a productivity score was high or low
 * Single-source-of-truth, deterministic & debuggable
 */
export const explainProductivityScore = async (userId, date) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const day = date ? toUTCDateOnly(date) : startOfUTCDate();
    if (!day) {
        throw new ApiError(400, "Invalid date");
    }

    const key = day.toISOString().slice(0, 10);

    const [behavior, statsMap] = await Promise.all([
        getBehaviorLogByDate(userId, day),
        buildDailyStatsMap(userId, day, day)
    ]);

    const stats = statsMap[key] ?? {
        total: 0,
        completed: 0,
        missed: 0
    };


    if (!behavior) {
        return {
            date: key,
            finalScore: 0,
            explanation: "No behavior log found for this day",
            breakdown: null,
            penalties: [],
            bonuses: [],
            tips: ["Log your daily behavior to track productivity"]
        };
    }


    const pointsPerTask =
        stats.total > 0 ? 100 / stats.total : 0;

    const baseScore =
        stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;


    const penalties = [];

    if (stats.missed > 0) {
        penalties.push({
            type: "MISSED_TASK",
            impact: stats.missed * -5,
            message: `Missed ${stats.missed} scheduled task${stats.missed > 1 ? "s" : ""}`
        });
    }

    if (
        behavior.sleepHours != null &&
        behavior.sleepHours < 5
    ) {
        penalties.push({
            type: "LOW_SLEEP",
            impact: -5,
            message: "Sleep was less than 5 hours"
        });
    }

    const bonuses = [];

    if (behavior.exercise === true) {
        bonuses.push({
            type: "EXERCISE",
            impact: +3,
            message: "Exercise improved focus and energy"
        });
    }


    const finalScore = calculateProductivityScore({
        ...stats,
        sleepHours: behavior.sleepHours,
        exercise: behavior.exercise
    });


    const tips = [];

    if (stats.completed < stats.total) {
        tips.push("Completing all tasks increases your base score");
    }

    if (behavior.sleepHours != null && behavior.sleepHours < 6) {
        tips.push("Try getting at least 6 hours of sleep");
    }

    if (!behavior.exercise) {
        tips.push("Light exercise can slightly boost productivity");
    }


    return {
        date: key,

        baseScore,

        breakdown: {
            totalTasks: stats.total,
            completedTasks: stats.completed,
            pointsPerTask: Number(pointsPerTask.toFixed(2))
        },

        penalties,
        bonuses,

        finalScore,
        tips
    };
};
