import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { buildDailyStatsMap } from "./dashboard.service.js";
import { getCurrentMonthYear } from "../utils/date.utils.js";

/* -------------------------------------------------------------------------- */
/*                               DATE UTILS                                   */
/* -------------------------------------------------------------------------- */

export const toUTCDate = (input) => {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return null;

    return new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate()
    ));
};

/* -------------------------------------------------------------------------- */
/*                       PRODUCTIVITY SCORE (WEIGHTED)                        */
/* -------------------------------------------------------------------------- */

const clamp = (v, min = 0, max = 100) =>
    Math.max(min, Math.min(max, v));

export const calculateProductivityScore = ({
    total,
    completed,
    missed,
    sleepHours,
    exercise,
    mood // HAPPY, NEUTRAL, SAD
}) => {
    let score = 0;

    // 1️⃣ Task Completion (Max 60 pts)
    if (total > 0) {
        const completionRate = completed / total;
        score += completionRate * 60;
    }

    // 2️⃣ Lifestyle Modifiers (Max 40 pts + Penalties)

    // Sleep (Max 10 pts)
    if (sleepHours != null) {
        if (sleepHours > 7) score += 10;       // Optimal
        else if (sleepHours >= 5) score += 5;  // Acceptable
        else score -= 10;                      // Deprived
    }

    // Exercise (Max 15 pts)
    if (exercise === true) score += 15;

    // Mood Impact (±5 pts)
    if (mood === "HAPPY") score += 5;
    else if (mood === "SAD") score -= 5;
    // NEUTRAL = 0

    // 3️⃣ Missed Task Penalty
    // Punish missed tasks, but cap the penalty
    if (missed > 0) {
        score -= Math.min(missed * 2, 20); // -2 per missed, max -20
    }

    return clamp(Math.round(score));
};

/* -------------------------------------------------------------------------- */
/*                           UPSERT (NO SCORE)                                 */
/* -------------------------------------------------------------------------- */

export const upsertBehaviorLog = async (userId, payload) => {
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { date, mood, notes, sleepHours, exercise } = payload;

    if (!mood) throw new ApiError(400, "Mood is required");

    const day = toUTCDate(date ?? new Date());
    if (!day) throw new ApiError(400, "Invalid date");

    const today = toUTCDate(new Date());
    if (day > today) {
        throw new ApiError(400, "Future dates are not allowed");
    }

    // 1️⃣ Check if log already exists
    const existing = await prisma.behaviorLog.findUnique({
        where: {
            userId_date: { userId, date: day }
        }
    });

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

    /**
     * 3️⃣ Increment usage ONLY if it's a NEW record
     * (editing same day should NOT count again)
     */
    if (!existing) {
        const { month, year } = getCurrentMonthYear();

        await prisma.usageStat.upsert({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year
                }
            },
            update: {
                behaviorCount: { increment: 1 }
            },
            create: {
                userId,
                month,
                year,
                behaviorCount: 1,
                taskCount: 0,
                scheduleCount: 0
            }
        });
    }

    return behavior;
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

    const day = toUTCDate(date);
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
        productivityScore: calculateProductivityScore({
            ...stats,
            sleepHours: behavior.sleepHours,
            exercise: behavior.exercise,
            mood: behavior.mood
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

    const end = toUTCDate(new Date());
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

        let score = 0;

        if (log) {
            // Calculate score for existing log
            const statsMap = await buildDailyStatsMap(userId, dayDate, dayDate);
            const stats = statsMap[key] ?? { total: 0, completed: 0, missed: 0 };

            score = calculateProductivityScore({
                ...stats,
                sleepHours: log.sleepHours,
                exercise: log.exercise,
                mood: log.mood
            });

            // Accumulate metadata for summary stats only from existing logs
            totalScore += score;
            moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
        }

        history.push({
            date: key,
            score
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

    const day = toUTCDate(date ?? new Date());
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
