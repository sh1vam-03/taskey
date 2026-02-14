import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { getCurrentMonthYear } from "../utils/date.utils.js";
import { validateSchedule } from "../ai/validators/schedule.validator.js";

// Create Schedule
export const createSchedule = async (data) => {
    const {
        userId,
        taskId,
        scheduleDate,
        startTime,
        endTime,
        recurrence,
        repeatUntil,
        repeatOnDays
    } = data;

    // Check task owner
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId
        }
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Normalize time
    // Normalize time (Force UTC to ensure consistent comparison)
    const normalizeStartTime = new Date(`1970-01-01T${startTime}:00Z`);
    const normalizeEndTime = new Date(`1970-01-01T${endTime}:00Z`);

    if (isNaN(normalizeStartTime.getTime()) || isNaN(normalizeEndTime.getTime())) {
        throw new ApiError(400, "Invalid startTime or endTime format (HH:mm required)");
    }

    if (normalizeStartTime >= normalizeEndTime) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    const normalizeRepeatUntil = repeatUntil
        ? new Date(`${repeatUntil}T23:59:59`)
        : null;

    // Check conflicts — must check ALL schedules that expand onto this date
    const allUserSchedules = await prisma.schedule.findMany({
        where: { userId },
        include: { task: { select: { title: true } } }
    });

    // 1. Validator Logic (AI Requirement)
    validateSchedule({
        scheduleDate,
        startTime,
        endTime
    });

    // 2. Conflict Check — use appliesOnDate to find schedules that actually appear on this date
    const targetDate = new Date(scheduleDate);
    for (const schedule of allUserSchedules) {
        if (appliesOnDate(schedule, targetDate) && hasTimeConflict(schedule, normalizeStartTime, normalizeEndTime)) {
            throw new ApiError(
                409,
                `Schedule conflict with existing "${schedule.task?.title || 'Unknown'}"`
            );
        }
    }

    // 3. Array/Overlap Validation (If needed, but here we process single)
    // The validateSchedule helper also checks array overlaps, but we are creating one.
    // If we wanted to batch create, we would pass array. Here we pass single object.

    // Duplicate check
    const duplicateWhere = {
        userId,
        taskId,
        scheduleDate: new Date(scheduleDate),
        startTime: normalizeStartTime,
        endTime: normalizeEndTime,
        recurrence,
        repeatUntil: normalizeRepeatUntil,
    };

    if (recurrence === "WEEKLY") {
        duplicateWhere.repeatOnDays = { equals: repeatOnDays };
    }

    const duplicate = await prisma.schedule.findFirst({
        where: duplicateWhere
    });

    if (duplicate) {
        throw new ApiError(409, "Schedule already exists");
    }

    // 1️⃣ Create schedule
    const schedule = await prisma.schedule.create({
        data: {
            scheduleDate: new Date(scheduleDate),
            startTime: normalizeStartTime,
            endTime: normalizeEndTime,
            recurrence,
            repeatUntil: normalizeRepeatUntil,
            repeatOnDays: repeatOnDays ?? [],
            userId,
            taskId
        }
    });

    // 2️⃣ Increment schedule usage
    const { month, year } = getCurrentMonthYear();

    await prisma.usageStat.update({
        where: {
            userId_month_year: {
                userId,
                month,
                year
            }
        },
        data: {
            scheduleCount: { increment: 1 }
        }
    });

    return schedule;
};


const startOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const appliesOnDate = (schedule, date) => {
    const sDate = startOfDay(schedule.scheduleDate);
    const cDate = startOfDay(date);

    if (cDate < sDate) return false;
    if (schedule.repeatUntil && cDate > schedule.repeatUntil) return false;

    switch (schedule.recurrence) {
        case "NONE":
            return cDate.getTime() === sDate.getTime();
        case "DAILY":
            return true;
        case "WEEKLY":
            return schedule.repeatOnDays.includes(cDate.getUTCDay());
        case "MONTHLY":
            return cDate.getUTCDate() === sDate.getUTCDate();
        default:
            return false;
    }
};

// Get All Schedules (Expanded Instances)
export const getSchedules = async (userId, from, to, taskId) => {
    // Default to Today -> Today + 30 days if no range provided
    const startDate = from ? new Date(from) : new Date();
    const endDate = to ? new Date(to) : new Date(new Date().setDate(new Date().getDate() + 30));

    // Normalize to UTC start/end of day
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    // 1. Fetch Definitions
    const schedules = await prisma.schedule.findMany({
        where: {
            userId,
            ...(taskId && { taskId }),
            OR: [
                {
                    recurrence: "NONE",
                    scheduleDate: { gte: startDate, lte: endDate }
                },
                {
                    recurrence: { not: "NONE" },
                    scheduleDate: { lte: endDate }, // Started before end of range
                    repeatUntil: { gte: startDate } // Ends after start of range
                }
            ]
        },
        include: {
            task: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    priority: true,
                    category: {
                        select: { id: true, name: true, color: true }
                    }
                }
            }
        }
    });

    // 2. Fetch Completions & Missed for Range
    const [completions, missed] = await Promise.all([
        prisma.scheduleCompletion.findMany({
            where: {
                userId,
                completedOn: { gte: startDate, lte: endDate }
            }
        }),
        prisma.missedSchedule.findMany({
            where: {
                userId,
                missedOn: { gte: startDate, lte: endDate }
            }
        })
    ]);

    const completedMap = new Map(); // key: "YYYY-MM-DD", val: Set(scheduleId)
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

    // 3. Expand Instances
    const instances = [];
    const loopDate = new Date(startDate);

    while (loopDate <= endDate) {
        const dayKey = loopDate.toISOString().slice(0, 10);
        const dayDate = new Date(loopDate); // copy

        for (const s of schedules) {
            if (appliesOnDate(s, dayDate)) {
                let status = "PENDING";
                if (completedMap.get(dayKey)?.has(s.id)) status = "COMPLETED";
                else if (missedMap.get(dayKey)?.has(s.id)) status = "MISSED";

                instances.push({
                    id: s.id, // Keep original ID for editing
                    scheduleId: s.id,
                    taskId: s.taskId,
                    title: s.task.title,
                    description: s.task.description,
                    priority: s.task.priority,
                    category: s.task.category,
                    scheduleDate: dayKey, // The specific instance date
                    startTime: s.startTime ? s.startTime.toISOString().slice(11, 16) : null,
                    endTime: s.endTime ? s.endTime.toISOString().slice(11, 16) : null,
                    status,
                    // Recurrence Details for Editing
                    recurrence: s.recurrence,
                    repeatUntil: s.repeatUntil ? s.repeatUntil.toISOString().split('T')[0] : null,
                    repeatOnDays: s.repeatOnDays,
                    notes: s.notes,
                    startScheduleDate: s.scheduleDate // Original recurrence start date
                });
            }
        }

        loopDate.setUTCDate(loopDate.getUTCDate() + 1);
    }

    // Sort by Date then Time
    return instances.sort((a, b) => {
        const dateA = new Date(`${a.scheduleDate}T${a.startTime || '00:00'}:00Z`);
        const dateB = new Date(`${b.scheduleDate}T${b.startTime || '00:00'}:00Z`);
        return dateA - dateB;
    });
};


// Update schedule
export const updateSchedule = async (userId, scheduleId, data) => {
    const {
        taskId,
        scheduleDate,
        startTime,
        endTime,
        recurrence,
        repeatUntil,
        repeatOnDays,
        notes
    } = data;

    // Fetch schedule
    const existing = await prisma.schedule.findFirst({
        where: {
            id: scheduleId,
            userId
        }
    });

    if (!existing) {
        throw new ApiError(404, "Schedule not found");
    }

    if (!existing) {
        throw new ApiError(404, "Schedule not found");
    }

    // 1. Validator Logic (AI Requirement)
    // This will throw an error if validation fails
    validateSchedule({
        scheduleDate,
        startTime,
        endTime
    });

    // Normalize time
    // Normalize time (Force UTC to ensure consistent comparison)
    const normalizeStartTime = new Date(`1970-01-01T${startTime}:00Z`);
    const normalizeEndTime = new Date(`1970-01-01T${endTime}:00Z`);

    if (isNaN(normalizeStartTime.getTime()) || isNaN(normalizeEndTime.getTime())) {
        throw new ApiError(400, "Invalid startTime or endTime format (HH:mm required)");
    }

    // Validate time
    if (normalizeStartTime >= normalizeEndTime) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    // Normalize RepeatUntil
    const normalizeRepeatUntil = repeatUntil ? new Date(`${repeatUntil}T23:59:59`) : null;


    // Check for time conflicts — must check ALL schedules that expand onto this date
    const allUserSchedules = await prisma.schedule.findMany({
        where: {
            userId,
            NOT: { id: scheduleId }
        },
        include: {
            task: {
                select: { title: true }
            }
        }
    });

    const targetDate = new Date(scheduleDate);
    for (const schedule of allUserSchedules) {
        if (appliesOnDate(schedule, targetDate) && hasTimeConflict(schedule, normalizeStartTime, normalizeEndTime)) {
            throw new ApiError(409,
                `Schedule conflict with existing "${schedule.task?.title || 'Unknown'}" (${schedule.startTime} - ${schedule.endTime})`);
        }
    }

    // Duplicate where to check the schedule is already exists or not
    const duplicateWhere = {
        userId,
        taskId: taskId || existing.taskId,
        scheduleDate: new Date(scheduleDate),
        startTime: normalizeStartTime,
        endTime: normalizeEndTime,
        recurrence,
        repeatUntil: normalizeRepeatUntil,
        NOT: {
            id: scheduleId
        }
    }

    // Only include repeatOnDays if recurrence is WEEKLY
    if (recurrence === "WEEKLY") {
        duplicateWhere.repeatOnDays = {
            equals: repeatOnDays
        };
    }

    // Duplicate check
    const Duplicate = await prisma.schedule.findFirst({
        where: duplicateWhere
    });

    if (Duplicate) {
        throw new ApiError(409, "Schedule already exists");
    }

    // Upadate the schedule
    const schedule = await prisma.schedule.update({
        where: {
            id: scheduleId,
        },
        data: {
            scheduleDate: new Date(scheduleDate),
            startTime: normalizeStartTime,
            endTime: normalizeEndTime,
            recurrence,
            repeatUntil: normalizeRepeatUntil,
            repeatOnDays: repeatOnDays ?? [],
            taskId: taskId || existing.taskId,
            notes,
        }
    });

    return schedule;
};


export const deleteSchedule = async (userId, scheduleId) => {

    // Find schedule owner
    const schedule = await prisma.schedule.findFirst({
        where: {
            id: scheduleId,
            userId
        }
    });

    if (!schedule) {
        throw new ApiError(404, "Schedule not found");
    }

    // Delete the schedule
    await prisma.schedule.delete({
        where: {
            id: scheduleId,
        }
    });
    return "Schedule deleted successfully";
};


// Helpers
const hasTimeConflict = (existing, startTime, endTime) => {
    return (
        existing.startTime < endTime &&
        startTime < existing.endTime
    );
};
