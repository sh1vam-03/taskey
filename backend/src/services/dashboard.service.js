import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { calculateBehaviorScore, calculateProductivityScore } from "../utils/score.utils.js";
import { startOfUTCDate, dayKey, appliesOnDate, getWeekRange, toUTCDateOnly } from "../utils/date.utils.js";
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';


export const getDashboardOverview = async (userId, dateString) => {
    // 1. Get Today's Data (Timeline + Counts)
    const todayData = await getTodayDashboard(userId, dateString);

    // 2. Get Streak Data
    const streakData = await getStreakOverview(userId);

    // 3. Get Behavior Score
    // We determine "today" based on the passed date or default
    const todayDate = dateString ? toUTCDateOnly(dateString) : startOfUTCDate();
    const performanceData = await getDailyPerformance(userId, todayDate);

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

export const getTodayDashboard = async (userId, dateString) => {
    // IF dateString is provided, use it. Else default to server today.
    const today = dateString ? toUTCDateOnly(dateString) : startOfUTCDate();
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
            include: {
                task: {
                    include: { category: true }
                }
            },
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
                OR: [
                    // Created today (matches taskDate exactly)
                    { taskDate: today },
                    // Due today
                    { dueDate: { gte: today, lt: tomorrow } },
                    // Multi-day: created before today AND due after today (middle days)
                    { taskDate: { lt: today }, dueDate: { gte: tomorrow } }
                ]
            },
            include: { category: true }
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
            description: s.task.description,
            notes: s.notes,
            priority: s.task.priority,
            category: s.task.category,
            recurrence: s.recurrence,
            repeatOnDays: s.repeatOnDays,
            scheduleDate: s.scheduleDate,
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
            description: t.description,
            priority: t.priority,
            category: t.category,
            dueDate: t.dueDate,
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
    const baseDate = toUTCDateOnly(dateString);
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
                taskDate: { gte: weekStart, lte: weekEnd }
            },
            include: { dailyCompletions: { select: { completedDate: true } } }
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

    // MissedMap is no longer used for dynamic calculation, but we keep the variable if needed or remove it.
    // We will calculate dynamic missed in the loop.

    const dailyCompletedMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!dailyCompletedMap.has(k)) dailyCompletedMap.set(k, new Set());
        dailyCompletedMap.get(k).add(c.taskId);
    });

    /* ------------------ INIT DAYS ------------------ */

    const days = {};
    const todayDynamic = toUTCDateOnly(new Date());

    for (let d = new Date(weekStart); d <= weekEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[dayKey(d)] = { total: 0, completed: 0, missed: 0, pending: 0 };
    }

    /* ------------------ SCHEDULED ------------------ */

    for (const s of schedules) {
        for (const key of Object.keys(days)) {
            const d = new Date(`${key}T00:00:00Z`);
            if (!appliesOnDate(s, d)) continue;

            days[key].total++;

            const isDone = completedMap.get(key)?.has(s.id);
            if (isDone) {
                days[key].completed++;
            } else {
                // Dynamic Missed Check
                if (d < todayDynamic) {
                    days[key].missed++;
                } else {
                    days[key].pending++;
                }
            }
        }
    }

    /* ------------------ UNSCHEDULED ------------------ */

    for (const t of unscheduledTasks) {
        const key = dayKey(startOfUTCDate(t.taskDate));
        if (!days[key]) continue;

        days[key].total++;
        const d = new Date(`${key}T00:00:00Z`);

        // Check if completed specifically on this day (via dailyCompletedMap)
        // OR check if completed EVER (via t.dailyCompletions.length > 0) to avoid showing as missed?
        // Logic: If completed on THIS day -> Completed.
        // If not completed on THIS day:
        //    If d < today:
        //        If completed EVER (t.dailyCompletions.length > 0) -> Not Missed (it was done).
        //        Else -> Missed.

        const isCompletedOnDay = dailyCompletedMap.get(key)?.has(t.id);

        if (isCompletedOnDay) {
            days[key].completed++;
        } else {
            if (d < todayDynamic) {
                // Only count as missed if never completed
                if (t.dailyCompletions.length === 0) {
                    days[key].missed++;
                }
            } else {
                days[key].pending++;
            }
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
                taskDate: { gte: monthStart, lte: monthEnd }
            },
            include: { dailyCompletions: { select: { completedDate: true } } }
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

    // MissedMap no longer used for dynamic calculation.

    const dailyCompletedMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!dailyCompletedMap.has(k)) dailyCompletedMap.set(k, new Set());
        dailyCompletedMap.get(k).add(c.taskId);
    });

    /* ------------------ INIT DAYS ------------------ */

    const days = {};
    const todayDynamic = toUTCDateOnly(new Date());

    for (let d = new Date(monthStart); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[dayKey(d)] = { total: 0, completed: 0, missed: 0, pending: 0 };
    }

    /* ------------------ SCHEDULED ------------------ */

    for (const s of schedules) {
        for (const key of Object.keys(days)) {
            const d = new Date(`${key}T00:00:00Z`);
            if (!appliesOnDate(s, d)) continue;

            days[key].total++;

            const isDone = completedMap.get(key)?.has(s.id);
            if (isDone) {
                days[key].completed++;
            } else {
                if (d < todayDynamic) {
                    days[key].missed++;
                } else {
                    days[key].pending++;
                }
            }
        }
    }

    /* ------------------ UNSCHEDULED ------------------ */

    for (const t of unscheduledTasks) {
        const key = dayKey(startOfUTCDate(t.taskDate));
        if (!days[key]) continue;

        days[key].total++;
        const d = new Date(`${key}T00:00:00Z`);

        const isCompletedOnDay = dailyCompletedMap.get(key)?.has(t.id);

        if (isCompletedOnDay) {
            days[key].completed++;
        } else {
            if (d < todayDynamic) {
                if (t.dailyCompletions.length === 0) {
                    days[key].missed++;
                }
            } else {
                days[key].pending++;
            }
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
    const start = toUTCDateOnly(startDate);

    const end = toUTCDateOnly(endDate);
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
                taskDate: { gte: start, lte: end }
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
            t => dayKey(startOfUTCDate(t.taskDate)) === key
        );

        // No work at all → EMPTY
        if (
            applicableSchedules.length === 0 &&
            unscheduledForDay.length === 0
        ) {
            perfectMap[key] = "EMPTY";
            continue;
        }

        // Any missed schedule kills the streak
        const missedCount = missedScheduleMap.get(key)?.size ?? 0;

        if (missedCount > 0) {
            perfectMap[key] = "MISSED";
            continue;
        }

        // Scheduled tasks must ALL be completed (Specific Check)
        if (applicableSchedules.length > 0) {
            const completedIds = completedScheduleMap.get(key) || new Set();
            const allDone = applicableSchedules.every(s => completedIds.has(s.id));

            if (!allDone) {
                perfectMap[key] = "MISSED";
                continue;
            }
        }

        // Unscheduled tasks must ALL be completed (Specific Check)
        if (unscheduledForDay.length > 0) {
            const completedIds = completedTaskMap.get(key) || new Set();
            const allDone = unscheduledForDay.every(t => completedIds.has(t.id));

            if (!allDone) {
                perfectMap[key] = "MISSED";
                continue;
            }
        }

        // STRICT PERFECT DAY
        perfectMap[key] = "PERFECT";
    }

    return perfectMap;
};


// Current Streak (Based on Activity > 0)
// Streak Metrics: Current (Perfect), Best (Perfect), Active (Attendance)
export const getStreakOverview = async (userId, date) => {
    const today = date ? toUTCDateOnly(date) : startOfUTCDate();
    const todayKey = dayKey(today);

    // 1. Determine Start Date (User Creation)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
    });
    const start = user ? startOfUTCDate(user.createdAt) : new Date(today.setFullYear(today.getFullYear() - 1));

    // 2. Fetch Daily Stats (For Perfect Streak Logic)
    // "Current Streak: Complete all task" implies Perfect Day (completed === total && total > 0)
    const statsMap = await buildDailyStatsMap(userId, start, today);
    const sortedKeys = Object.keys(statsMap).sort();

    // 3. Fetch All Activity Dates (For Active Streak Logic - "Login/Activity")
    const [
        taskCreations,
        taskCompletions,
        scheduleCompletions,
        sessions,
        behaviorLogs
    ] = await Promise.all([
        prisma.task.findMany({ where: { userId }, select: { createdAt: true } }),
        prisma.taskDailyCompletion.findMany({ where: { userId }, select: { completedDate: true } }),
        prisma.scheduleCompletion.findMany({ where: { userId }, select: { completedOn: true } }),
        prisma.session.findMany({ where: { userId }, select: { createdAt: true } }),
        prisma.behaviorLog.findMany({ where: { userId }, select: { date: true } })
    ]);

    const activeDates = new Set();
    const addDate = (d) => activeDates.add(dayKey(new Date(d)));

    taskCreations.forEach(x => addDate(x.createdAt));
    taskCompletions.forEach(x => addDate(x.completedDate));
    scheduleCompletions.forEach(x => addDate(x.completedOn));
    sessions.forEach(x => addDate(x.createdAt));
    behaviorLogs.forEach(x => addDate(x.date));

    // ================= CALCULATION =================

    // Helper: Is Perfect Day?
    const isPerfect = (k) => {
        const s = statsMap[k];
        if (!s) return false;
        // Require total > 0 and 100% completion (or completed >= total)
        // Also check if missed > 0? Strictly if completed >= total, missed implies extra/duplicate?
        // Let's use score === 100 AND total > 0.
        return s.total > 0 && s.score === 100;
    };

    // Helper: Calculate Streak based on specific check function
    const calculateStreak = (checkFn) => {
        let current = 0;
        let best = 0;
        let run = 0;

        // Best Streak (All Time)
        // Iterate form start to today
        let dIter = new Date(start);
        while (dIter <= today) {
            const k = dayKey(dIter);
            if (checkFn(k)) {
                run++;
            } else {
                run = 0;
            }
            best = Math.max(best, run);
            dIter.setUTCDate(dIter.getUTCDate() + 1);
        }

        // Current Streak (Backwards from Today)
        let dCurr = new Date(today); // Check Today
        const kToday = dayKey(dCurr);

        // If today is NOT perfect/active, check if yesterday was.
        // If today IS perfect/active, start counting from today.
        if (!checkFn(kToday)) {
            dCurr.setUTCDate(dCurr.getUTCDate() - 1);
        }

        while (true) {
            if (dCurr < start) break;
            const k = dayKey(dCurr);
            if (checkFn(k)) {
                current++;
                dCurr.setUTCDate(dCurr.getUTCDate() - 1);
            } else {
                break;
            }
        }
        return { current, best };
    };

    // A. Perfect Streak (Current & Best)
    const perfectStats = calculateStreak(isPerfect);

    // B. Active Streak (Attendance - "Active Streak")
    // User requested "Active Streak" to be the consecutive run using Login logic.
    // We treat this as the "Active Streak" value.
    const isActiveDate = (k) => activeDates.has(k);
    const activeStats = calculateStreak(isActiveDate);

    return {
        currentStreak: perfectStats.current,
        longestStreak: perfectStats.best, // "Best Streak: Longest run of Current Streak"
        activeStreak: activeStats.current, // "Active Streak: increase when user login..."
        totalActiveDays: activeDates.size, // Keep metric available
        isActive: perfectStats.current > 0
    };
};

// Streak Calender
export const getStreakCalendar = async (userId, days = 90, endDate) => {
    const today = endDate ? toUTCDateOnly(endDate) : startOfUTCDate();
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - (days - 1));

    // Use buildDailyStatsMap to get real activity counts (Total, Completed, etc.)
    // This matches the Calendar Month data refrence requested by user.
    const stats = await buildDailyStatsMap(userId, start, today);
    return stats; // Returns { days: {...} } or just the map? buildDailyStatsMap currently returns nothing explicitly in the viewed snippet?

};


// Performance engine — mirrors calendar.service.js logic exactly
export const buildDailyStatsMap = async (userId, startDate, endDate) => {
    const start = toUTCDateOnly(startDate);
    const end = toUTCDateOnly(endDate);

    // Exclusive end for DB queries (day after end)
    const queryEnd = new Date(end);
    queryEnd.setUTCDate(queryEnd.getUTCDate() + 1);

    /* ==================== FETCH (same as calendar) ==================== */

    const [
        schedules,
        scheduleCompletions,
        missedSchedules,
        unscheduledTasks,
        dailyCompletions
    ] = await Promise.all([

        // Schedules — same query as getWeekCalendar / getMonthCalendar
        prisma.schedule.findMany({
            where: {
                userId,
                OR: [
                    {
                        recurrence: "NONE",
                        scheduleDate: { gte: start, lt: queryEnd }
                    },
                    {
                        recurrence: { not: "NONE" },
                        scheduleDate: { lt: queryEnd },
                        OR: [
                            { repeatUntil: null },
                            { repeatUntil: { gte: start } }
                        ]
                    }
                ]
            }
        }),

        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: start, lt: queryEnd }
            }
        }),

        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: start, lt: queryEnd }
            }
        }),

        // Unscheduled — same query as calendar
        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                OR: [
                    { taskDate: { gte: start, lt: queryEnd } },
                    { dueDate: { gte: start }, taskDate: { lt: queryEnd } }
                ]
            },
            include: { dailyCompletions: { select: { completedDate: true } } }
        }),

        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: { gte: start, lt: queryEnd }
            }
        })
    ]);

    /* ==================== INDEX MAPS ==================== */

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

    const dailyCompletedMap = new Map();
    dailyCompletions.forEach(c => {
        const k = dayKey(c.completedDate);
        if (!dailyCompletedMap.has(k)) dailyCompletedMap.set(k, new Set());
        dailyCompletedMap.get(k).add(c.taskId);
    });

    /* ==================== BUILD STATS PER DAY ==================== */

    const statsMap = {};
    const todayForStats = toUTCDateOnly(new Date());

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const key = dayKey(d);
        const dayDate = toUTCDateOnly(key);

        // --- Scheduled items (same as calendar: appliesOnDate) ---
        const applicableSchedules = schedules.filter(s => appliesOnDate(s, dayDate));
        const scheduledTotal = applicableSchedules.length;

        const completedScheduled = applicableSchedules.filter(
            s => completedScheduleMap.get(key)?.has(s.id)
        ).length;

        const missedScheduled = applicableSchedules.filter(
            s => missedScheduleMap.get(key)?.has(s.id)
        ).length;

        // --- Unscheduled items (same multi-day bucketing as calendar) ---
        const unscheduledForDay = [];
        for (const task of unscheduledTasks) {
            const taskStart = startOfUTCDate(task.taskDate);
            const taskEnd = task.dueDate ? startOfUTCDate(task.dueDate) : taskStart;
            if (dayDate >= taskStart && dayDate <= taskEnd) {
                unscheduledForDay.push(task);
            }
        }

        const unscheduledTotal = unscheduledForDay.length;
        const unscheduledIds = new Set(unscheduledForDay.map(t => t.id));
        const dayCompletedTasks = dailyCompletedMap.get(key);
        const completedUnscheduled = dayCompletedTasks
            ? [...dayCompletedTasks].filter(id => unscheduledIds.has(id)).length
            : 0;

        // Calculate Missed Unscheduled (Calendar Logic: pending && date < today)
        let missedUnscheduled = 0;
        if (dayDate < todayForStats) {
            const completedIds = dayCompletedTasks ? new Set([...dayCompletedTasks]) : new Set();
            missedUnscheduled = unscheduledForDay.filter(t => t.dailyCompletions.length === 0).length;
        }

        // --- Totals ---
        const total = scheduledTotal + unscheduledTotal;
        const completed = completedScheduled + completedUnscheduled;
        const missed = missedScheduled + missedUnscheduled;

        statsMap[key] = {
            total,
            completed,
            missed,
            score: total === 0 ? 0 : Math.round((completed / total) * 100),
            totalActivity: (dailyCompletedMap.get(key)?.size ?? 0) + (completedScheduleMap.get(key)?.size ?? 0)
        };
    }

    return statsMap;
};


// Daily Performance (Hourly Breakdown)
export const getDailyPerformance = async (userId, date = new Date()) => {
    const day = toUTCDateOnly(date);
    const end = new Date(day);
    end.setUTCHours(23, 59, 59, 999);

    /* ------------------ FETCH ------------------ */

    const [user, behaviorLog, dailyCompletions, statsMap, schedules, scheduleCompletions, unscheduledTasks, missedSchedules] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true }
        }),
        prisma.behaviorLog.findUnique({
            where: { userId_date: { userId, date: day } }
        }),
        prisma.taskDailyCompletion.findMany({
            where: {
                userId,
                completedDate: day
            },
            select: { taskId: true, completedAt: true }
        }),
        buildDailyStatsMap(userId, day, day),
        // Fetch schedules for today (same pattern as calendar)
        prisma.schedule.findMany({
            where: {
                userId,
                OR: [
                    { recurrence: "NONE", scheduleDate: day },
                    {
                        recurrence: { not: "NONE" },
                        scheduleDate: { lte: day },
                        OR: [
                            { repeatUntil: null },
                            { repeatUntil: { gte: day } }
                        ]
                    }
                ]
            }
        }),
        // Fetch schedule completions for hourly breakdown
        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: day
            },
            select: { scheduleId: true, completedAt: true }
        }),
        // Fetch unscheduled tasks for today (same as buildDailyStatsMap)
        prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                schedules: { none: {} },
                OR: [
                    { taskDate: { gte: day, lte: end } },
                    { dueDate: { gte: day }, taskDate: { lte: end } }
                ]
            },
            select: { id: true, createdAt: true, taskDate: true, dueDate: true, dailyCompletions: { select: { completedDate: true } } }
        }),
        // Fetch missed schedules for hourly breakdown
        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: day
            },
            include: { schedule: { select: { endTime: true } } }
        })
    ]);

    const timezone = user?.timezone || "Asia/Kolkata";

    /* ------------------ HOURLY BREAKDOWN ------------------ */

    const hourly = Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        completed: 0,
        total: 0,
        missed: 0
    }));

    // Helper to get local hour (0-23)
    const getLocalHour = (date) => {
        try {
            return parseInt(formatInTimeZone(date, timezone, 'H'), 10);
        } catch (e) {
            return new Date(date).getUTCHours(); // Fallback
        }
    };

    // Populate hourly totals from schedules that apply today
    const todaySchedules = schedules.filter(s => appliesOnDate(s, day));
    todaySchedules.forEach(s => {
        if (s.startTime) {
            // Schedule startTime is stored as "Abstract Time" in UTC (e.g. 09:00Z means 9 AM intended)
            // So we use getUTCHours() directly to preserve the intended hour, regardless of timezone.
            const hour = new Date(s.startTime).getUTCHours();
            if (hourly[hour]) hourly[hour].total++;
        }
    });

    // Populate hourly totals from Unscheduled tasks
    // Logic: If created today -> show at creation time. If created before -> show at 09:00.
    const dayDate = toUTCDateOnly(day);
    const todayForStats = toUTCDateOnly(new Date());
    // Filter unscheduled tasks for today (same logic as buildDailyStatsMap loop)
    const unscheduledForDay = [];
    for (const task of unscheduledTasks) {
        const taskStart = startOfUTCDate(task.taskDate);
        const taskEnd = task.dueDate ? startOfUTCDate(task.dueDate) : taskStart;
        if (dayDate >= taskStart && dayDate <= taskEnd) {
            unscheduledForDay.push(task);
        }
    }

    const startOfDay = new Date(day);
    const endOfDay = new Date(day);
    endOfDay.setUTCHours(23, 59, 59, 999);

    unscheduledForDay.forEach(t => {
        let hour = 9; // Default to 09:00 for pre-existing tasks

        // If created TODAY, use creation time
        if (t.createdAt >= startOfDay && t.createdAt <= endOfDay) {
            hour = getLocalHour(t.createdAt);
        }

        if (hourly[hour]) hourly[hour].total++;
    });

    // Populate hourly MISSED from Scheduled tasks (Dynamic Calculation)
    // Logic: If schedule is NOT completed AND (day < today OR (day == today && endTime < now)) -> Missed
    const currentLocalTime = toZonedTime(new Date(), timezone);
    const isToday = day.getTime() === todayForStats.getTime();
    const isPastDay = day < todayForStats;

    const completedScheduleIds = new Set();
    scheduleCompletions.forEach(c => completedScheduleIds.add(c.scheduleId));

    todaySchedules.forEach(s => {
        if (!completedScheduleIds.has(s.id)) {
            // It is pending. Check if missed.
            if (s.endTime) {
                const endHour = new Date(s.endTime).getUTCHours();
                const endMinute = new Date(s.endTime).getUTCMinutes();

                let isMissed = false;
                if (isPastDay) {
                    isMissed = true;
                } else if (isToday) {
                    // Check if end time passed
                    const currentHour = currentLocalTime.getHours();
                    const currentMinute = currentLocalTime.getMinutes();

                    if (endHour < currentHour || (endHour === currentHour && endMinute < currentMinute)) {
                        isMissed = true;
                    }
                }

                if (isMissed) {
                    // Show at end time
                    if (hourly[endHour]) hourly[endHour].missed++;
                }
            }
        }
    });

    // Populate hourly MISSED from Unscheduled tasks
    // Logic: If date < today AND not completed -> Show at 00:00 (Midnight)
    // Logic: If date < today AND not completed -> Show at 00:00 (Midnight)
    if (dayDate < todayForStats) {
        const completedUnscheduledIds = new Set();
        dailyCompletions.forEach(c => {
            completedUnscheduledIds.add(c.taskId);
        });

        unscheduledForDay.forEach(t => {
            if (t.dailyCompletions.length === 0) {
                // It is missed on this day.
                // Show at 00:00 per user request.
                if (hourly[0]) hourly[0].missed++;
            }
        });
    }

    // Deduplicate completions by taskId per hour (prevents re-toggle inflation)
    const seenTaskIds = new Set();
    dailyCompletions.forEach(c => {
        if (!seenTaskIds.has(c.taskId)) {
            seenTaskIds.add(c.taskId);
            const hour = getLocalHour(c.completedAt);
            if (hourly[hour]) hourly[hour].completed++;
        }
    });

    // Add schedule completions (deduplicate by scheduleId)
    const seenScheduleIds = new Set();
    scheduleCompletions.forEach(c => {
        if (!seenScheduleIds.has(c.scheduleId) && c.completedAt) {
            seenScheduleIds.add(c.scheduleId);
            const hour = getLocalHour(c.completedAt);
            if (hourly[hour]) hourly[hour].completed++;
        }
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
            total: dayStat.total,
            completed: dayStat.completed,
            missed: dayStat.missed,
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
export const getMonthlyPerformance = async (userId, year, month, currentDate) => {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const today = currentDate ? toUTCDateOnly(currentDate) : startOfUTCDate();
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
            total: dayStat.total,
            completed: dayStat.completed,
            missed: dayStat.missed,
            score,
            behaviorScore
        });
    }

    return {
        month: `${year} -${String(month).padStart(2, "0")} `,
        history,
        completionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
        totalCompleted,
        productivityScore: daysWithScore > 0 ? Math.round(totalScore / daysWithScore) : 0
    };
};

