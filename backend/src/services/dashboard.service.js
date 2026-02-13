import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { calculateBehaviorScore, calculateProductivityScore } from "../utils/score.utils.js";
import { startOfUTCDate, dayKey, appliesOnDate, getWeekRange } from "../utils/date.utils.js";


export const getDashboardOverview = async (userId) => {
    /*
        const today = startOfUTCDate();
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
    
        // 1 Fetch all relevant data
    
        const [
            schedules,
            scheduleCompletions,
            missedSchedules,
            unscheduledTasks,
            dailyCompletions
        ] = await Promise.all([
    
            prisma.schedule.findMany({
                where: {
                    userId,
                    scheduleDate: { lte: today },
                    OR: [
                        { repeatUntil: null },
                        { repeatUntil: { gte: today } }
                    ]
                }
            }),
    
            prisma.scheduleCompletion.findMany({
                where: { userId, completedOn: today }
            }),
    
            prisma.missedSchedule.findMany({
                where: { userId, missedOn: today }
            }),
    
            prisma.task.findMany({
                where: {
                    userId,
                    deletedAt: null,
                    schedules: { none: {} },
                    createdAt: { gte: today, lt: tomorrow }
                }
            }),
    
            prisma.taskDailyCompletion.findMany({
                where: { userId, completedDate: today }
            })
        ]);
    
        // 2 Build lookup sets
    
        const completedScheduleSet = new Set(
            scheduleCompletions.map(c => c.scheduleId)
        );
    
        const missedScheduleSet = new Set(
            missedSchedules.map(m => m.scheduleId)
        );
    
        const completedTaskSet = new Set(
            dailyCompletions.map(c => c.taskId)
        );
    
        // Count scheduled tasks
    
        let scheduledTotal = 0;
        let scheduledCompleted = 0;
        let scheduledMissed = 0;
    
        for (const s of schedules) {
            if (!appliesOnDate(s, today)) continue;
    
            scheduledTotal++;
    
            if (completedScheduleSet.has(s.id)) scheduledCompleted++;
            else if (missedScheduleSet.has(s.id)) scheduledMissed++;
        }
    
        // 4 Count unscheduled tasks
    
        const unscheduledTotal = unscheduledTasks.length;
        let unscheduledCompleted = 0;
    
        for (const t of unscheduledTasks) {
            if (completedTaskSet.has(t.id)) unscheduledCompleted++;
        }
    
        // 5 Final aggregation
    
        const totalTasks = scheduledTotal + unscheduledTotal;
        const completedTasks = scheduledCompleted + unscheduledCompleted;
        const missedTasks = scheduledMissed;
        const pendingTasks = Math.max(
            totalTasks - completedTasks - missedTasks,
            0
        );


        return {
        today: {
            totalTasks,
            completedTasks,
            missedTasks,
            pendingTasks
        }

    */

    // 1. Get Today's Data (Timeline + Counts)
    const todayData = await getTodayDashboard(userId);

    // 2. Get Streak Data
    const streakData = await getStreakOverview(userId);

    // 3. Get Behavior Data (Summary / Score)
    // We'll get the summary for the last 7 days to show a "Score" or recent trend
    // Or if the frontend shows a specific "Behavior Score" for *today*, we might need today's log.
    // The frontend shows "overview?.behaviorScore".
    // Let's see if we can get today's score.
    // We can use getBehaviorLogByDate(userId, new Date()) but we need to import it.
    // Let's assume for now we want the "Daily Optimization" score which is likely today's score.
    // If no log exists, score is 0.

    // We'll return a structure matching what the frontend expects:
    // overview.todayTasksCount
    // overview.todayTasksTotal
    // overview.completedTasksCount
    // overview.behaviorScore
    // overview.currentStreak
    // overview.timeline

    // Calculate counts from todayData
    const { total, completed, pending } = todayData.stats;

    // Get today's behavior score (we need to be careful with imports)
    // Since we are in dashboard.service, we can't easily import behavior.service if it creates a circular dependency.
    // behavior.service imports dashboard.service (for stats map).
    // So we CANNOT import behavior.service here.
    // We have to rely on what we can query or move the logic.
    // However, we can use prisma directly here to fetch valid behavior log if needed,
    // OR we can move the aggregation to the controller which can import both services.
    // BUT the user asked to "Trace backend..." and "Fix...".
    // Best practice: Keep service logic pure.
    // Let's use the controller for aggregation?
    // The previous implementation was in the service.
    // Let's try to do it here using Prisma to avoid circular dep if needed, or just import if valid.
    // Check behavior.service.js... it imports `buildDailyStatsMap` from dashboard.service.
    // If I import behaviorService here, it will cycle.
    // SOLUTION: Use the controller to aggregate, OR implement a lightweight fetch here.
    // Actually, `getDashboardOverview` in `dashboard.controller.js` calls `dashboardService.getDashboardOverview`.
    // I will rewrite this function to do the aggregation manually using the other functions IN THIS FILE
    // and maybe a direct prisma call for behavior if strictly necessary, or just return 0 for now and let the frontend fetch strictly?
    // NO, the frontend expects it in `overview`.
    // I will simply fetch the behavior log using Prisma here to get the score, duplicating the score logic slightly or standardizing it?
    // The score logic is complex (in checkBehavior... wait, in help function).
    // `calculateProductivityScore` is exported from `behavior.service.js`? No, it's not exported?
    // Wait, let me check behavior.service.js exports.
    // It exports `calculateProductivityScore`.
    // So I can import `calculateProductivityScore` from behavior.service.js?
    // `import { calculateProductivityScore } from "./behavior.service.js"`
    // `behavior.service.js` imports `buildDailyStatsMap` from `dashboard.service.js`.
    // This IS a circular dependency.
    // modification: I will move `calculateProductivityScore` to a shared util or just replicate the simple math here.
    // It's: (completed/total)*100 - missed*5 ...
    // Let's just do a basic fetch for "today's behavior log" and calculated score using the stats we already have.

    // 4. Calculate Scores Consistency Fix
    // We used to do ad-hoc calculation here, now we will use the shared logic
    // We already called getTodayDashboard which returns stats.
    // Ideally we should use buildDailyStatsMap to be 100% sure we match performance page,
    // but getTodayDashboard largely does the same thing.
    // Let's rely on standard logic components.

    // 4. Score Consistency Fix (FINAL)
    const todayDate = startOfUTCDate();
    // We call getDailyPerformance directly to ensure 100% matching logic with Performance Page.
    const performanceData = await getDailyPerformance(userId, todayDate);

    // Calculate pending from todayData (for the specific task list view)
    // We use todayData for the counters to match the timeline shown on the left.
    // But for the SCORE card, we use performanceData.
    const pendingCount = todayData.stats.pending;

    return {
        todayTasksCount: pendingCount,
        todayTasksTotal: todayData.stats.total,
        completedTasksCount: todayData.stats.completed,
        productivityScore: performanceData.productivityScore,
        behaviorScore: performanceData.behaviorScore,
        currentStreak: streakData.currentStreak,
        timeline: todayData.timeline
    };
};

export const getTodayDashboard = async (userId) => {
    const today = startOfUTCDate();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    /* ------------------ FETCH DATA (PARALLEL) ------------------ */

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyTaskCompletions
    ] = await Promise.all([
        prisma.schedule.findMany({
            where: {
                userId,
                OR: [
                    { recurrence: "NONE", scheduleDate: today },
                    {
                        recurrence: { not: "NONE" },
                        scheduleDate: { lte: today },
                        repeatUntil: { gte: today }
                    }
                ]
            },
            include: { task: true },
            orderBy: { startTime: "asc" }
        }),

        prisma.scheduleCompletion.findMany({
            where: { userId, completedOn: today },
            select: { scheduleId: true }
        }),

        prisma.missedSchedule.findMany({
            where: { userId, missedOn: today },
            select: { scheduleId: true }
        }),

        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                createdAt: { gte: today, lt: tomorrow }
            }
        }),

        prisma.taskDailyCompletion.findMany({
            where: { userId, completedDate: today },
            select: { taskId: true }
        })
    ]);

    /* ------------------ MAPS (FAST LOOKUPS) ------------------ */

    const completedScheduleSet = new Set(
        scheduleCompletions.map(c => c.scheduleId)
    );

    const missedScheduleSet = new Set(
        missedSchedules.map(m => m.scheduleId)
    );

    const completedTaskSet = new Set(
        dailyTaskCompletions.map(c => c.taskId)
    );

    /* ------------------ BUILD TIMELINE ------------------ */

    const timeline = [];

    // Scheduled
    for (const s of schedules) {
        if (!appliesOnDate(s, today)) continue;

        let status = "PENDING";
        if (completedScheduleSet.has(s.id)) status = "COMPLETED";
        else if (missedScheduleSet.has(s.id)) status = "MISSED";

        timeline.push({
            id: s.id, // Explicit ID
            type: "SCHEDULED",
            scheduleId: s.id,
            taskId: s.taskId,
            title: s.task.title,
            priority: s.task.priority,
            startTime: s.startTime?.toISOString().slice(11, 16),
            endTime: s.endTime?.toISOString().slice(11, 16),
            status
        });
    }

    // Unscheduled
    for (const t of unscheduledTasks) {
        timeline.push({
            id: t.id, // Explicit ID
            type: "UNSCHEDULED",
            taskId: t.id,
            title: t.title,
            priority: t.priority,
            startTime: null,
            endTime: null,
            status: completedTaskSet.has(t.id) ? "COMPLETED" : "PENDING"
        });
    }

    /* ------------------ STATS ------------------ */

    const stats = {
        total: timeline.length,
        completed: timeline.filter(t => t.status === "COMPLETED").length,
        missed: timeline.filter(t => t.status === "MISSED").length,
        pending: timeline.filter(t => t.status === "PENDING").length
    };

    return {
        date: dayKey(today),
        stats,
        timeline
    };
};

export const getWeeklyDashboard = async (userId, dateString) => {
    const baseDate = startOfUTCDate(new Date(dateString));
    const { weekStart, weekEnd } = getWeekRange(baseDate);

    /* ------------------ FETCH ONCE ------------------ */

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyCompletions
    ] = await Promise.all([
        prisma.schedule.findMany({
            where: {
                userId,
                OR: [
                    { recurrence: "NONE", scheduleDate: { gte: weekStart, lte: weekEnd } },
                    {
                        recurrence: { not: "NONE" },
                        scheduleDate: { lte: weekEnd },
                        repeatUntil: { gte: weekStart }
                    }
                ]
            }
        }),

        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: weekStart, lte: weekEnd }
            }
        }),

        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: weekStart, lte: weekEnd }
            }
        }),

        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                createdAt: { gte: weekStart, lte: weekEnd }
            }
        }),

        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: { gte: weekStart, lte: weekEnd }
            }
        })
    ]);

    /* ------------------ MAPS ------------------ */

    const completedMap = new Map();
    scheduleCompletions.forEach(c => {
        const k = dayKey(c.completedOn);
        if (!completedMap.has(k)) completedMap.set(k, new Set());
        completedMap.get(k).add(c.scheduleId);
    });

    const missedMap = new Map();
    missedSchedules.forEach(m => {
        const k = dayKey(m.missedOn);
        if (!missedMap.has(k)) missedMap.set(k, new Set());
        missedMap.get(k).add(m.scheduleId);
    });

    const dailyCompletedMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!dailyCompletedMap.has(k)) dailyCompletedMap.set(k, new Set());
        dailyCompletedMap.get(k).add(c.taskId);
    });

    /* ------------------ INIT DAYS ------------------ */

    const days = {};
    for (let d = new Date(weekStart); d <= weekEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[dayKey(d)] = { total: 0, completed: 0, missed: 0, pending: 0 };
    }

    /* ------------------ SCHEDULED ------------------ */

    for (const s of schedules) {
        for (const key of Object.keys(days)) {
            const d = new Date(`${key}T00:00:00Z`);
            if (!appliesOnDate(s, d)) continue;

            days[key].total++;

            if (completedMap.get(key)?.has(s.id)) days[key].completed++;
            else if (missedMap.get(key)?.has(s.id)) days[key].missed++;
            else days[key].pending++;
        }
    }

    /* ------------------ UNSCHEDULED ------------------ */

    for (const t of unscheduledTasks) {
        const key = dayKey(startOfUTCDate(t.createdAt));
        if (!days[key]) continue;

        days[key].total++;

        if (dailyCompletedMap.get(key)?.has(t.id)) {
            days[key].completed++;
        } else {
            days[key].pending++;
        }
    }

    /* ------------------ SUMMARY ------------------ */

    const summary = Object.values(days).reduce(
        (acc, d) => {
            acc.total += d.total;
            acc.completed += d.completed;
            acc.missed += d.missed;
            acc.pending += d.pending;
            return acc;
        },
        { total: 0, completed: 0, missed: 0, pending: 0 }
    );

    summary.completionRate = summary.total
        ? Math.round((summary.completed / summary.total) * 100)
        : 0;

    return {
        weekStart: dayKey(weekStart),
        weekEnd: dayKey(weekEnd),
        summary,
        days
    };
};

export const getMonthlyDashboard = async (userId, year, month) => {
    const { monthStart, monthEnd } = getMonthRange(year, month);

    /* ------------------ FETCH ONCE ------------------ */

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyCompletions
    ] = await Promise.all([
        prisma.schedule.findMany({
            where: {
                userId,
                OR: [
                    { recurrence: "NONE", scheduleDate: { gte: monthStart, lte: monthEnd } },
                    {
                        recurrence: { not: "NONE" },
                        scheduleDate: { lte: monthEnd },
                        repeatUntil: { gte: monthStart }
                    }
                ]
            }
        }),

        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: monthStart, lte: monthEnd }
            }
        }),

        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: monthStart, lte: monthEnd }
            }
        }),

        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                createdAt: { gte: monthStart, lte: monthEnd }
            }
        }),

        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: { gte: monthStart, lte: monthEnd }
            }
        })
    ]);

    /* ------------------ MAPS ------------------ */

    const completedMap = new Map();
    scheduleCompletions.forEach(c => {
        const k = dayKey(c.completedOn);
        if (!completedMap.has(k)) completedMap.set(k, new Set());
        completedMap.get(k).add(c.scheduleId);
    });

    const missedMap = new Map();
    missedSchedules.forEach(m => {
        const k = dayKey(m.missedOn);
        if (!missedMap.has(k)) missedMap.set(k, new Set());
        missedMap.get(k).add(m.scheduleId);
    });

    const dailyCompletedMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!dailyCompletedMap.has(k)) dailyCompletedMap.set(k, new Set());
        dailyCompletedMap.get(k).add(c.taskId);
    });

    /* ------------------ INIT DAYS ------------------ */

    const days = {};
    for (let d = new Date(monthStart); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[dayKey(d)] = { total: 0, completed: 0, missed: 0, pending: 0 };
    }

    /* ------------------ SCHEDULED ------------------ */

    for (const s of schedules) {
        for (const key of Object.keys(days)) {
            const d = new Date(`${key}T00:00:00Z`);
            if (!appliesOnDate(s, d)) continue;

            days[key].total++;

            if (completedMap.get(key)?.has(s.id)) days[key].completed++;
            else if (missedMap.get(key)?.has(s.id)) days[key].missed++;
            else days[key].pending++;
        }
    }

    /* ------------------ UNSCHEDULED ------------------ */

    for (const t of unscheduledTasks) {
        const key = dayKey(startOfUTCDate(t.createdAt));
        if (!days[key]) continue;

        days[key].total++;

        if (dailyCompletedMap.get(key)?.has(t.id)) {
            days[key].completed++;
        } else {
            days[key].pending++;
        }
    }

    /* ------------------ SUMMARY ------------------ */

    const summary = Object.values(days).reduce(
        (acc, d) => {
            acc.total += d.total;
            acc.completed += d.completed;
            acc.missed += d.missed;
            acc.pending += d.pending;
            return acc;
        },
        { total: 0, completed: 0, missed: 0, pending: 0 }
    );

    summary.completionRate = summary.total
        ? Math.round((summary.completed / summary.total) * 100)
        : 0;

    return {
        month: `${year}-${String(month).padStart(2, "0")}`,
        summary,
        days
    };
};

// Helpers

const getMonthRange = (year, month) => {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { monthStart: start, monthEnd: end };
};



// STRICT streak engine
export const buildPerfectDayMap = async (userId, startDate, endDate) => {
    const start = startOfUTCDate(startDate);

    const end = new Date(startOfUTCDate(endDate));
    end.setUTCHours(23, 59, 59, 999); // FULL DAY END

    /* ---------------- FETCH DATA ONCE ---------------- */

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyCompletions
    ] = await Promise.all([

        // Scheduled tasks (including recurring)
        prisma.schedule.findMany({
            where: {
                userId,
                scheduleDate: { lte: end },
                OR: [
                    { repeatUntil: null },
                    { repeatUntil: { gte: start } }
                ]
            }
        }),

        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: start, lte: end }
            }
        }),

        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: start, lte: end }
            }
        }),

        // Unscheduled tasks (created in range)
        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                createdAt: { gte: start, lte: end }
            }
        }),

        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: { gte: start, lte: end }
            }
        })
    ]);

    /* ---------------- INDEX MAPS ---------------- */

    const completedScheduleMap = new Map();
    scheduleCompletions.forEach(c => {
        const k = dayKey(c.completedOn);
        if (!completedScheduleMap.has(k)) completedScheduleMap.set(k, new Set());
        completedScheduleMap.get(k).add(c.scheduleId);
    });

    const missedScheduleMap = new Map();
    missedSchedules.forEach(m => {
        const k = dayKey(m.missedOn);
        if (!missedScheduleMap.has(k)) missedScheduleMap.set(k, new Set());
        missedScheduleMap.get(k).add(m.scheduleId);
    });

    const completedTaskMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!completedTaskMap.has(k)) completedTaskMap.set(k, new Set());
        completedTaskMap.get(k).add(c.taskId);
    });

    /* ---------------- STRICT PERFECT DAY LOGIC ---------------- */

    const perfectMap = {};

    for (
        let d = new Date(start);
        d <= end;
        d.setUTCDate(d.getUTCDate() + 1)
    ) {
        const key = dayKey(d);

        const applicableSchedules = schedules.filter(s =>
            appliesOnDate(s, d)
        );

        const unscheduledForDay = unscheduledTasks.filter(
            t => dayKey(startOfUTCDate(t.createdAt)) === key
        );

        // No work at all → NOT a streak day
        if (
            applicableSchedules.length === 0 &&
            unscheduledForDay.length === 0
        ) {
            perfectMap[key] = false;
            continue;
        }

        // Any missed schedule kills the streak
        const missedCount = missedScheduleMap.get(key)?.size ?? 0;
        if (missedCount > 0) {
            perfectMap[key] = false;
            continue;
        }

        // Scheduled tasks must ALL be completed
        if (applicableSchedules.length > 0) {
            const completed = completedScheduleMap.get(key)?.size ?? 0;
            if (completed !== applicableSchedules.length) {
                perfectMap[key] = false;
                continue;
            }
        }

        // Unscheduled tasks must ALL be completed
        if (unscheduledForDay.length > 0) {
            const completed = completedTaskMap.get(key)?.size ?? 0;
            if (completed !== unscheduledForDay.length) {
                perfectMap[key] = false;
                continue;
            }
        }

        // STRICT PERFECT DAY
        perfectMap[key] = true;
    }

    return perfectMap;
};


// Current Streak
export const getStreakOverview = async (userId) => {
    const today = startOfUTCDate();
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - 364);

    const map = await buildPerfectDayMap(userId, start, today);
    const keys = Object.keys(map).sort();

    let current = 0;
    for (let i = keys.length - 1; i >= 0; i--) {
        if (!map[keys[i]]) break;
        current++;
    }

    let longest = 0;
    let run = 0;
    let totalActiveDays = 0;

    for (const k of keys) {
        if (map[k]) {
            run++;
            longest = Math.max(longest, run);
            totalActiveDays++;
        } else {
            run = 0;
        }
    }

    return {
        currentStreak: current,
        longestStreak: longest,
        totalActiveDays,
        isActive: current > 0
    };
};

// Streak Calender
export const getStreakCalendar = async (userId, days = 90) => {
    const today = startOfUTCDate();
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - (days - 1));

    return await buildPerfectDayMap(userId, start, today);
};


// Performance engine
export const buildDailyStatsMap = async (userId, startDate, endDate) => {
    const start = startOfUTCDate(startDate);
    const end = new Date(startOfUTCDate(endDate));
    end.setUTCHours(23, 59, 59, 999); // FULL DAY RANGE

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyCompletions
    ] = await Promise.all([

        /* ---------- Scheduled ---------- */
        prisma.schedule.findMany({
            where: {
                userId,
                scheduleDate: { lte: end },
                OR: [
                    { repeatUntil: null },
                    { repeatUntil: { gte: start } }
                ]
            }
        }),

        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: start, lte: end }
            }
        }),

        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: start, lte: end }
            }
        }),

        /* ---------- Unscheduled (FIXED) ---------- */
        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                createdAt: { gte: start, lte: end } // STRICT RANGE
            }
        }),

        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: { gte: start, lte: end }
            }
        })
    ]);

    /* ---------- Index maps ---------- */

    const completedScheduleMap = new Map();
    scheduleCompletions.forEach(c => {
        const k = dayKey(c.completedOn);
        if (!completedScheduleMap.has(k)) completedScheduleMap.set(k, new Set());
        completedScheduleMap.get(k).add(c.scheduleId);
    });

    const missedScheduleMap = new Map();
    missedSchedules.forEach(m => {
        const k = dayKey(m.missedOn);
        if (!missedScheduleMap.has(k)) missedScheduleMap.set(k, new Set());
        missedScheduleMap.get(k).add(m.scheduleId);
    });

    const completedTaskMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!completedTaskMap.has(k)) completedTaskMap.set(k, new Set());
        completedTaskMap.get(k).add(c.taskId);
    });

    /* ---------- Stats ---------- */

    const statsMap = {};

    for (
        let d = new Date(start);
        d <= end;
        d.setUTCDate(d.getUTCDate() + 1)
    ) {
        const key = dayKey(d);

        const applicableSchedules = schedules.filter(s =>
            appliesOnDate(s, d)
        );

        const unscheduledForDay = unscheduledTasks.filter(
            t => dayKey(startOfUTCDate(t.createdAt)) === key
        );

        const scheduledTotal = applicableSchedules.length;
        const unscheduledTotal = unscheduledForDay.length;

        const completedScheduled =
            completedScheduleMap.get(key)?.size ?? 0;

        const completedUnscheduled =
            completedTaskMap.get(key)?.size ?? 0;

        const missed =
            missedScheduleMap.get(key)?.size ?? 0;

        const total = scheduledTotal + unscheduledTotal;
        const completed = Math.min(
            completedScheduled + completedUnscheduled,
            total
        );

        statsMap[key] = {
            total,
            completed,
            missed,
            score: total === 0
                ? 0
                : Math.round((completed / total) * 100)
        };
    }

    return statsMap;
};

// Daily Performance (Hourly Breakdown)
export const getDailyPerformance = async (userId, date = new Date()) => {
    const day = startOfUTCDate(date);
    const end = new Date(day);
    end.setUTCHours(23, 59, 59, 999);

    /* ------------------ FETCH ------------------ */

    const [behaviorLog, dailyCompletions, statsMap] = await Promise.all([
        prisma.behaviorLog.findUnique({
            where: { userId_date: { userId, date: day } }
        }),
        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: day
            },
            select: { completedAt: true }
        }),
        buildDailyStatsMap(userId, day, day)
    ]);

    /* ------------------ HOURLY BREAKDOWN ------------------ */

    const hourly = Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        completed: 0
    }));

    dailyCompletions.forEach(c => {
        const hour = new Date(c.completedAt).getHours(); // Local or UTC? Prisma returns UTC usually but let's assume consistent
        if (hourly[hour]) hourly[hour].completed++;
    });

    /* ------------------ SCORE ------------------ */

    const key = dayKey(day);
    const stats = statsMap[key] || { total: 0, completed: 0, missed: 0 };

    const behaviorScore = calculateBehaviorScore({
        sleepHours: behaviorLog?.sleepHours,
        exercise: behaviorLog?.exercise,
        mood: behaviorLog?.mood
    });

    const productivityScore = calculateProductivityScore({
        total: stats.total,
        completed: stats.completed,
        missed: stats.missed,
        behaviorScore
    });

    return {
        date: key,
        hourly,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        totalCompleted: stats.completed,
        productivityScore,
        behaviorScore
    };
};

// Weekly Performance (Daily Breakdown)
export const getWeeklyPerformance = async (userId, date = new Date()) => {
    const { weekStart, weekEnd } = getWeekRange(date);
    const map = await buildDailyStatsMap(userId, weekStart, weekEnd);

    // Fetch behaviors for the week to calculate daily scores
    const behaviorLogs = await prisma.behaviorLog.findMany({
        where: {
            userId,
            date: { gte: weekStart, lte: weekEnd }
        }
    });

    const behaviorMap = new Map();
    behaviorLogs.forEach(b => behaviorMap.set(dayKey(b.date), b));

    const daily = [];
    let totalScore = 0;
    let daysWithScore = 0;
    let totalCompleted = 0;
    let totalTasks = 0;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let d = new Date(weekStart); d <= weekEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        const key = dayKey(d);
        const dayStat = map[key] || { total: 0, completed: 0, missed: 0 };
        const behavior = behaviorMap.get(key);

        const behaviorScore = calculateBehaviorScore({
            sleepHours: behavior?.sleepHours,
            exercise: behavior?.exercise,
            mood: behavior?.mood
        });

        const score = calculateProductivityScore({
            total: dayStat.total,
            completed: dayStat.completed,
            missed: dayStat.missed,
            behaviorScore
        });

        if (dayStat.total > 0 || behavior) {
            totalScore += score;
            daysWithScore++;
        }

        totalCompleted += dayStat.completed;
        totalTasks += dayStat.total;

        daily.push({
            day: days[d.getUTCDay()],
            date: key,
            completed: dayStat.completed,
            score,
            behaviorScore
        });
    }

    return {
        weekStart: dayKey(weekStart),
        weekEnd: dayKey(weekEnd),
        daily,
        completionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
        totalCompleted,
        productivityScore: daysWithScore > 0 ? Math.round(totalScore / daysWithScore) : 0
    };
};

// Monthly Performance (History Trend)
export const getMonthlyPerformance = async (userId, year, month) => {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const today = startOfUTCDate();
    const effectiveEnd = end > today ? today : end;

    const map = await buildDailyStatsMap(userId, start, effectiveEnd);

    // Fetch behaviors
    const behaviorLogs = await prisma.behaviorLog.findMany({
        where: {
            userId,
            date: { gte: start, lte: effectiveEnd }
        }
    });
    const behaviorMap = new Map();
    behaviorLogs.forEach(b => behaviorMap.set(dayKey(b.date), b));

    const history = [];
    let totalScore = 0;
    let daysWithScore = 0;
    let totalCompleted = 0;
    let totalTasks = 0;

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const key = dayKey(d);
        // Only fill up to today/effective end, fill rest with empty/future projection if needed?
        // Frontend expects full month? usually history is up to now.
        if (d > effectiveEnd) break;

        const dayStat = map[key] || { total: 0, completed: 0, missed: 0 };
        const behavior = behaviorMap.get(key);

        const behaviorScore = calculateBehaviorScore({
            sleepHours: behavior?.sleepHours,
            exercise: behavior?.exercise,
            mood: behavior?.mood
        });

        const score = calculateProductivityScore({
            total: dayStat.total,
            completed: dayStat.completed,
            missed: dayStat.missed,
            behaviorScore
        });

        if (dayStat.total > 0 || behavior) {
            totalScore += score;
            daysWithScore++;
        }

        totalCompleted += dayStat.completed;
        totalTasks += dayStat.total;

        history.push({
            date: key,
            completionRate: dayStat.total > 0 ? Math.round((dayStat.completed / dayStat.total) * 100) : 0,
            completed: dayStat.completed,
            score,
            behaviorScore
        });
    }

    return {
        month: `${year}-${String(month).padStart(2, "0")}`,
        history,
        completionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
        totalCompleted,
        productivityScore: daysWithScore > 0 ? Math.round(totalScore / daysWithScore) : 0
    };
};

