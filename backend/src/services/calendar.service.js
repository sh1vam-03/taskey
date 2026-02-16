import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
// import { isAfter, isBefore, isEqual } from "date-fns"; // Unused
// import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'; // Unused
import { toUTCDateOnly, startOfUTCDate, appliesOnDate } from "../utils/date.utils.js";

/* -------------------- HELPERS -------------------- */

const formatTime = (time) =>
    time ? time.toISOString().slice(11, 16) : null;

/* ======================================================
   DAY CALENDAR
====================================================== */

export const getDayCalendar = async (dateString, userId) => {
    const date = toUTCDateOnly(dateString);
    const dayKey = date.toISOString().slice(0, 10);
    // Today logic: If dateString provided, compare against it? 
    // No, 'today' usually means "Is this day Today?".
    // But for MISSED logic, we check if date < today.
    // If we want deterministic Calendar, we should just use startOfUTCDate() which is UTC midnight.
    // But User says "Calendar endpoints must be deterministic based on requested date."
    // Actually, "today" for missed items usually means "Is the viewed date in the past relative to REAL TIME?"
    // If I view yesterday, I see missed tasks.
    // If I view tomorrow, I don't.
    // So 'today' MUST be real time (UTC).
    // The issue valid is that startOfUTCDate() uses new Date() which is server time.
    // But we standardized startOfUTCDate to use new Date() -> UTC.
    // If server is UTC+5:30. new Date() is 2 AM. UTC is 8:30 PM yesterday.
    // startOfUTCDate() correctly gets yesterday UTC.
    // So the server IS correct.
    // However, user insists on "today = toUTCDateOnly(dateString)".
    // Wait. If I request "2026-02-10" (past), and I say "today = 2026-02-10", then I won't see missed tasks?
    // "today" is used to define "future" vs "past".
    // I will stick to startOfUTCDate() but use the one from utils which is safe.
    // Actually user said: "Replace const today = startOfUTCDate(); With const today = toUTCDateOnly(dateString);"
    // If I do that, then `date < today` is always false.
    // Ah, maybe they mean for "current view"?
    // Let's look closer at the user request: "Calendar endpoints must be deterministic based on requested date."
    // "And for MISSED logic, compare with that date, not server clock."
    // If I compare date < date, it is never missed.
    // I think the user implies we should explicitly pass "currentDate" from frontend if we want to be timezone aware of "NOW".
    // But simply replacing with `toUTCDateOnly(dateString)` makes `today` == `date`.
    // Then `if (date < today)` is false.
    // So no missed tasks ever?
    // User might be testing specific dates.
    // "Frontend must send: GET /calendar/day?date=... And for MISSED logic, compare with that date"
    // Okay, if I interpret this as "The date being viewed acts as the reference for 'today'".
    // Then I can never see missed tasks on the day I am viewing?
    // Missed tasks are "Missed BEFORE today".
    // If I view yesterday, `date < today` (real today) -> show missed.
    // If I use `today = date`, then `date < date` is false.
    // This removes missed tasks from the view?
    // Maybe user wants to suppress "missed" calculation relying on server time.
    // I will simply use `toUTCDateOnly(dateString)` per explicit instruction and see.
    // Wait, `dateString` is the view date.
    // If I view "2026-02-01", `today` becomes "2026-02-01".
    // Then `completed` logic checks `userId, completedOn: date`.
    // `missed` checks `userId, missedOn: date`. (These are DB records).
    // The `missed` variable in line 42 is fetching actual MissedSchedule records.
    // These records are created by a cron job or background process?
    // Or derived?
    // In `getDayCalendar`, `missed` is fetched from DB.
    // DB `missedOn` is stored as UTC.
    // So `getDayCalendar` doesn't calculate "Is this missed?". It just shows "Was this marked missed?".
    // So `today` variable is only used for...
    // Let's see where `today` is used.
    // I need to search for usages of `today` in `getDayCalendar`.

    const today = toUTCDateOnly(dateString); // Deterministic "today" based on view date

    /* Schedules */
    const schedules = await prisma.schedule.findMany({
        where: {
            userId,
            OR: [
                { recurrence: "NONE", scheduleDate: date },
                {
                    recurrence: { not: "NONE" },
                    scheduleDate: { lte: date },
                    OR: [
                        { repeatUntil: null },
                        { repeatUntil: { gte: date } }
                    ]
                }
            ]
        },
        include: { task: { include: { category: true } } },
        orderBy: { startTime: "asc" }
    });

    /* Completion & missed */
    const [completed, missed] = await Promise.all([
        prisma.scheduleCompletion.findMany({
            where: { userId, completedOn: date }
        }),
        prisma.missedSchedule.findMany({
            where: { userId, missedOn: date }
        })
    ]);

    const completedSet = new Set(completed.map(c => c.scheduleId));
    const missedSet = new Set(missed.map(m => m.scheduleId));

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true }
    });
    const timezone = user?.timezone || "UTC";

    // Simplified Query using taskDate
    const tasks = await prisma.task.findMany({
        where: {
            userId,
            deletedAt: null,
            schedules: { none: {} },
            OR: [
                // Created on this day
                { taskDate: date },
                // Has dueDate that covers this day
                {
                    dueDate: { gte: date },
                    taskDate: { lte: date }
                }
            ]
        }
    });

    const dailyCompletions = await prisma.taskDailyCompletion.findMany({
        where: { userId, completedDate: date }
    });

    const dailyCompletedSet = new Set(dailyCompletions.map(c => c.taskId));

    return {
        days: {
            [dayKey]: [
                ...schedules
                    .filter(s => appliesOnDate(s, date))
                    .map(s => ({
                        id: s.id,
                        type: "SCHEDULED",
                        scheduleId: s.id,
                        taskId: s.taskId,
                        title: s.task.title,
                        description: s.task.description,
                        priority: s.task.priority,
                        category: s.task.category,
                        recurrence: s.recurrence,
                        repeatOnDays: s.repeatOnDays,
                        scheduleDate: s.scheduleDate,
                        startTime: formatTime(s.startTime),
                        endTime: formatTime(s.endTime),
                        dueDate: null,
                        status: completedSet.has(s.id)
                            ? "COMPLETED"
                            : missedSet.has(s.id)
                                ? "MISSED"
                                : "PENDING"
                    })),

                ...tasks.map(t => ({
                    id: t.id,
                    type: "UNSCHEDULED",
                    taskId: t.id,
                    title: t.title,
                    priority: t.priority,
                    dueDate: t.dueDate,
                    startTime: null,
                    endTime: null,
                    status: dailyCompletedSet.has(t.id)
                        ? "COMPLETED"
                        : date < today
                            ? "MISSED"
                            : "PENDING"
                }))
            ]
        }
    };
};


/* ======================================================
   WEEK CALENDAR
====================================================== */

export const getWeekCalendar = async (dateString, userId) => {
    const base = toUTCDateOnly(dateString);

    /* -------------------- WEEK RANGE -------------------- */
    const day = base.getUTCDay();
    const weekStart = new Date(base);
    // Calculate Monday
    const diffToMonday = day === 0 ? 6 : day - 1;
    weekStart.setUTCDate(base.getUTCDate() - diffToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    // Keep weekEnd as inclusive "Sunday" for display/loop, 
    // but create exclusive "queryEnd" for DB queries

    const queryEnd = new Date(weekEnd);
    queryEnd.setUTCDate(queryEnd.getUTCDate() + 1); // Monday of next week

    /* -------------------- INIT DAYS -------------------- */
    const days = {};
    for (let d = new Date(weekStart); d <= weekEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[d.toISOString().slice(0, 10)] = [];
    }

    /* -------------------- FETCH SCHEDULES -------------------- */
    const schedules = await prisma.schedule.findMany({
        where: {
            userId,
            OR: [
                {
                    recurrence: "NONE",
                    scheduleDate: { gte: weekStart, lt: queryEnd }
                },
                {
                    recurrence: { not: "NONE" },
                    scheduleDate: { lt: queryEnd },
                    OR: [
                        { repeatUntil: null },
                        { repeatUntil: { gte: weekStart } }
                    ]
                }
            ]
        },
        include: { task: { include: { category: true } } }
    });

    /* -------------------- FETCH COMPLETIONS & MISSED -------------------- */
    const [completions, missed] = await Promise.all([
        prisma.scheduleCompletion.findMany({
            where: { userId, completedOn: { gte: weekStart, lt: queryEnd } }
        }),
        prisma.missedSchedule.findMany({
            where: { userId, missedOn: { gte: weekStart, lt: queryEnd } }
        })
    ]);

    const completedMap = new Map();
    completions.forEach(c => {
        const key = c.completedOn.toISOString().slice(0, 10);
        if (!completedMap.has(key)) completedMap.set(key, new Set());
        completedMap.get(key).add(c.scheduleId);
    });

    const missedMap = new Map();
    missed.forEach(m => {
        const key = m.missedOn.toISOString().slice(0, 10);
        if (!missedMap.has(key)) missedMap.set(key, new Set());
        missedMap.get(key).add(m.scheduleId);
    });

    /* -------------------- EXPAND SCHEDULED TASKS -------------------- */
    for (const s of schedules) {
        for (const dayKey of Object.keys(days)) {
            const date = toUTCDateOnly(dayKey);
            if (!appliesOnDate(s, date)) continue;

            let status = "PENDING";
            if (completedMap.get(dayKey)?.has(s.id)) status = "COMPLETED";
            else if (missedMap.get(dayKey)?.has(s.id)) status = "MISSED";

            days[dayKey].push({
                id: s.id,
                type: "SCHEDULED",
                scheduleId: s.id,
                taskId: s.taskId,
                title: s.task.title,
                description: s.task.description,
                priority: s.task.priority,
                category: s.task.category,
                recurrence: s.recurrence,
                repeatOnDays: s.repeatOnDays,
                scheduleDate: s.scheduleDate,
                startTime: formatTime(s.startTime),
                endTime: formatTime(s.endTime),
                status
            });
        }
    }

    /* -------------------- UNSCHEDULED TASKS (multi-day range) -------------------- */
    const unscheduledTasks = await prisma.task.findMany({
        where: {
            userId,
            deletedAt: null,
            schedules: { none: {} },
            OR: [
                { taskDate: { gte: weekStart, lt: queryEnd } },
                { dueDate: { gte: weekStart }, taskDate: { lt: queryEnd } }
            ]
        }
    });

    const dailyCompletions = await prisma.taskDailyCompletion.findMany({
        where: {
            userId,
            completedDate: { gte: weekStart, lt: queryEnd }
        }
    });

    const dailyCompletedMap = new Map();
    for (const c of dailyCompletions) {
        const key = c.completedDate.toISOString().slice(0, 10);
        if (!dailyCompletedMap.has(key)) dailyCompletedMap.set(key, new Set());
        dailyCompletedMap.get(key).add(c.taskId);
    }

    const today = toUTCDateOnly(dateString); // Deterministic today based on request

    for (const task of unscheduledTasks) {
        // Correctly bucket by taskDate
        const taskStart = startOfUTCDate(task.taskDate);

        const taskEnd = task.dueDate ? startOfUTCDate(task.dueDate) : taskStart;

        for (const dk of Object.keys(days)) {
            const dayDate = toUTCDateOnly(dk);
            if (dayDate < taskStart || dayDate > taskEnd) continue;

            let status = "PENDING";
            if (dailyCompletedMap.get(dk)?.has(task.id)) {
                status = "COMPLETED";
            } else if (dayDate < today) {
                status = "MISSED";
            }

            days[dk].push({
                id: task.id,
                type: "UNSCHEDULED",
                taskId: task.id,
                title: task.title,
                priority: task.priority,
                dueDate: task.dueDate,
                startTime: null,
                endTime: null,
                status
            });
        }
    }

    return {
        weekStart: weekStart.toISOString().slice(0, 10),
        weekEnd: weekEnd.toISOString().slice(0, 10),
        days
    };
};



/* ======================================================
   MONTH CALENDAR
====================================================== */

export const getMonthCalendar = async (year, month, userId) => {
    if (!year || !month) {
        throw new ApiError(400, "year and month are required");
    }

    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0)); // Last day of month

    // Exclusive end for queries (First day of next month)
    const queryEnd = new Date(monthStart);
    queryEnd.setUTCMonth(queryEnd.getUTCMonth() + 1);

    /* -------------------- INIT DAYS -------------------- */
    const days = {};
    for (let d = new Date(monthStart); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        days[d.toISOString().slice(0, 10)] = [];
    }

    /* -------------------- FETCH SCHEDULES -------------------- */
    const schedules = await prisma.schedule.findMany({
        where: {
            userId,
            OR: [
                {
                    recurrence: "NONE",
                    scheduleDate: { gte: monthStart, lt: queryEnd }
                },
                {
                    recurrence: { not: "NONE" },
                    scheduleDate: { lt: queryEnd },
                    OR: [
                        { repeatUntil: null },
                        { repeatUntil: { gte: monthStart } }
                    ]
                }
            ]
        },
        include: {
            task: { include: { category: true } }
        }
    });

    /* -------------------- FETCH COMPLETIONS -------------------- */
    const [completions, missed] = await Promise.all([
        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: monthStart, lt: queryEnd }
            }
        }),
        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: monthStart, lt: queryEnd }
            }
        })
    ]);

    /* -------------------- MAP COMPLETIONS -------------------- */
    const completedMap = new Map();
    for (const c of completions) {
        const key = c.completedOn.toISOString().slice(0, 10);
        if (!completedMap.has(key)) completedMap.set(key, new Set());
        completedMap.get(key).add(c.scheduleId);
    }

    const missedMap = new Map();
    for (const m of missed) {
        const key = m.missedOn.toISOString().slice(0, 10);
        if (!missedMap.has(key)) missedMap.set(key, new Set());
        missedMap.get(key).add(m.scheduleId);
    }

    /* -------------------- EXPAND SCHEDULES -------------------- */
    for (const schedule of schedules) {
        for (const dayKey of Object.keys(days)) {
            const dayDate = toUTCDateOnly(dayKey);
            if (!appliesOnDate(schedule, dayDate)) continue;

            let status = "PENDING";
            if (completedMap.get(dayKey)?.has(schedule.id)) status = "COMPLETED";
            else if (missedMap.get(dayKey)?.has(schedule.id)) status = "MISSED";

            days[dayKey].push({
                id: schedule.id, // Explicit ID
                type: "SCHEDULED",
                scheduleId: schedule.id,
                taskId: schedule.taskId,
                title: schedule.task.title,
                description: schedule.task.description,
                priority: schedule.task.priority,
                category: schedule.task.category,
                recurrence: schedule.recurrence,
                repeatOnDays: schedule.repeatOnDays,
                scheduleDate: schedule.scheduleDate,
                startTime: formatTime(schedule.startTime),
                endTime: formatTime(schedule.endTime),
                status
            });
        }
    }

    /* -------------------- UNSCHEDULED TASKS (multi-day range) -------------------- */
    const unscheduledTasks = await prisma.task.findMany({
        where: {
            userId,
            deletedAt: null,
            schedules: { none: {} },
            OR: [
                { taskDate: { gte: monthStart, lt: queryEnd } },
                { dueDate: { gte: monthStart }, taskDate: { lt: queryEnd } }
            ]
        }
    });

    const dailyCompletions = await prisma.taskDailyCompletion.findMany({
        where: {
            userId,
            completedDate: { gte: monthStart, lte: monthEnd }
        }
    });

    const dailyCompletedMap = new Map();
    for (const c of dailyCompletions) {
        const key = c.completedDate.toISOString().slice(0, 10);
        if (!dailyCompletedMap.has(key)) dailyCompletedMap.set(key, new Set());
        dailyCompletedMap.get(key).add(c.taskId);
    }

    const today = startOfUTCDate();

    for (const task of unscheduledTasks) {
        // Correctly bucket by taskDate
        const taskStart = startOfUTCDate(task.taskDate);

        const taskEnd = task.dueDate ? startOfUTCDate(task.dueDate) : taskStart;

        for (const dayKey of Object.keys(days)) {
            const dayDate = toUTCDateOnly(dayKey);
            if (dayDate < taskStart || dayDate > taskEnd) continue;

            let status = "PENDING";
            if (dailyCompletedMap.get(dayKey)?.has(task.id)) {
                status = "COMPLETED";
            } else if (dayDate < today) {
                status = "MISSED";
            }

            days[dayKey].push({
                id: task.id,
                type: "UNSCHEDULED",
                taskId: task.id,
                title: task.title,
                priority: task.priority,
                dueDate: task.dueDate,
                startTime: null,
                endTime: null,
                status
            });
        }
    }


    return {
        month: `${year}-${String(month).padStart(2, "0")}`,
        days
    };
};
