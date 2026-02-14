import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { getCurrentMonthYear, startOfUTCDate } from "../utils/date.utils.js";

export const createTask = async (userId, taskData) => {
    const { title, description, priority, dueDate, categoryId } = taskData;

    // Validate category if provided
    if (categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
            },
        });

        if (!category) {
            throw new ApiError(404, "Category not found");
        }
    }

    // 1️⃣ Create task
    const task = await prisma.task.create({
        data: {
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            categoryId,
            userId,
        },
    });

    // Usage increment is handled by the controller via incrementUsage()

    return task;
};



export const getTasks = async (userId, query) => {
    const {
        categoryId,
        priority,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeArchived = 'false',
        excludeCompleted,
        date,
        dueDate
    } = query;

    const where = {
        userId,
        deletedAt: null
    };

    // Archived Check
    if (includeArchived === 'true') {
        where.isArchived = true;
    } else {
        where.isArchived = false;
    }

    if (categoryId && categoryId !== 'ALL') {
        where.categoryId = categoryId;
    }

    if (priority && priority !== 'ALL') {
        where.priority = priority;
    }

    if (search) {
        where.title = {
            contains: search,
            mode: 'insensitive'
        };
    }

    // Determine Date Mode (Today/Calendar vs Master List)
    const completionContextDate = date
        ? startOfUTCDate(new Date(date))
        : (dueDate ? startOfUTCDate(new Date(dueDate)) : null);

    // Completion Filter (Only in Date Mode)
    if (completionContextDate && excludeCompleted === 'true') {
        where.dailyCompletions = {
            none: {
                completedDate: completionContextDate
            }
        };
    }

    // Smart Date Filter (Only if dueDate is provided - Date Mode)
    if (dueDate) {
        const targetDate = startOfUTCDate(new Date(dueDate));
        const targetEnd = new Date(targetDate);
        targetEnd.setUTCDate(targetDate.getUTCDate() + 1);
        const dayOfWeek = targetDate.getUTCDay();

        where.OR = [
            // 1. Unscheduled & Created on this day
            { AND: [{ dueDate: null }, { createdAt: { gte: targetDate, lt: targetEnd } }] },

            // 2. Completed on this day
            { dailyCompletions: { some: { completedDate: targetDate } } },

            // 3. Scheduled on this day (Recurrence logic)
            {
                schedules: {
                    some: {
                        OR: [
                            // Single Occurrence on Target Date
                            { recurrence: 'NONE', scheduleDate: { gte: targetDate, lt: targetEnd } },

                            // Recurring Active
                            {
                                recurrence: { in: ['DAILY', 'WEEKLY', 'MONTHLY'] },
                                scheduleDate: { lte: targetDate },
                                AND: [
                                    { OR: [{ repeatUntil: null }, { repeatUntil: { gte: targetDate } }] },
                                    {
                                        OR: [
                                            { recurrence: 'DAILY' },
                                            { recurrence: 'WEEKLY', repeatOnDays: { has: dayOfWeek } },
                                            { recurrence: 'MONTHLY' }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Fetch data
    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            skip,
            take,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                category: true,
                schedules: true,
                dailyCompletions: completionContextDate ? {
                    where: {
                        completedDate: completionContextDate
                    }
                } : false
            }
        }),
        prisma.task.count({ where })
    ]);

    // Format response
    const formattedTasks = tasks.map(task => {
        const primarySchedule = task.schedules && task.schedules.length > 0 ? task.schedules[0] : null;

        // Status Logic
        let status = 'ACTIVE';
        if (completionContextDate) {
            status = task.dailyCompletions && task.dailyCompletions.length > 0 ? 'COMPLETED' : 'PENDING';
        }

        return {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            isArchived: task.isArchived,
            createdAt: task.createdAt,
            category: task.category ? {
                id: task.category.id,
                name: task.category.name,
                color: task.category.color,
                icon: task.category.icon
            } : null,
            schedule: primarySchedule ? {
                type: primarySchedule.recurrence,
                date: primarySchedule.scheduleDate,
                days: primarySchedule.repeatOnDays,
                until: primarySchedule.repeatUntil,
                time: primarySchedule.startTime
            } : null,
            status
        };
    });

    return {
        tasks: formattedTasks,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};


export const getTask = async (userId, taskId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
            deletedAt: null
        },
        include: {
            category: true,
            schedules: true
        }
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return task;
}

export const updateTask = async (userId, taskId, taskData) => {

    // Find task (owner + soft delete check)
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // validate category id if provide
    if (taskData.categoryId) {
        const category = await prisma.category.findFirst({
            where: {
                id: taskData.categoryId,
                userId
            }
        });

        if (!category) {
            throw new ApiError(404, "Category not found");
        }
    }

    const data = {};

    if (taskData.title !== undefined) {
        if (!taskData.title || !taskData.title.trim()) {
            throw new ApiError(400, "Title is required");
        }
        data.title = taskData.title.trim();
    }

    if (taskData.description !== undefined) {
        data.description = taskData.description;
    }

    if (taskData.priority !== undefined) {
        data.priority = taskData.priority;
    }

    if (taskData.dueDate !== undefined) {
        data.dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;
    }

    if (taskData.categoryId !== undefined) {
        data.categoryId = taskData.categoryId;
    }

    if (taskData.order !== undefined) {
        data.order = taskData.order;
    }

    if (taskData.isArchived !== undefined) {
        data.isArchived = taskData.isArchived;
    }

    // update task
    const updateTask = await prisma.task.update({
        where: {
            id: taskId
        },
        data
    });

    return updateTask;
}


export const deleteTask = async (userId, taskId) => {
    // Find task (owner + soft delete check)
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
            deletedAt: null
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // soft delete task
    await prisma.task.update({
        where: {
            id: taskId
        },
        data: {
            deletedAt: new Date(),
            isArchived: true
        }
    });

    return;
}
