import * as taskService from "../../services/task.service.js";
import * as scheduleService from "../../services/schedule.service.js";
import * as calendarService from "../../services/calendar.service.js";
import prisma from "../../config/db.js";
import { incrementUsage } from "../../services/usageLimit.service.js";
import { formatInTimeZone } from 'date-fns-tz';
import { toUTCDateOnly } from "../../utils/date.utils.js";

/**
 * Validates 'data' against the Zod schema and maps the string 'action'
 * to our backend services (acting as manual tool execution).
 */
export const executeAction = async (action, data, config) => {
    const userId = config.configurable?.user?.id || config.configurable?.userId;
    if (!userId) return { error: true, message: "User ID missing in configuration." };

    switch (action) {
        case "create_task": {
            try {
                if (!data.title) return { error: true, message: "Title is required to create a task." };

                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                const taskDate = toUTCDateOnly(localDateStr);

                const task = await taskService.createTask(userId, { ...data, taskDate });
                await incrementUsage(userId, 'task');
                return { success: true, message: "Task created successfully.", task };
            } catch (error) {
                console.error(`[Executor Error] create_task:`, error);
                return { error: true, message: `Failed to create task: ${error.message}` };
            }
        }

        case "create_tasks_bulk": {
            try {
                if (!data.tasks || !Array.isArray(data.tasks)) {
                    return { error: true, message: "Invalid payload for bulk task creation." };
                }

                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                const defaultTaskDate = toUTCDateOnly(localDateStr);

                const createdTasks = [];
                for (const taskData of data.tasks) {
                    if (!taskData.title) continue;
                    let taskDate = defaultTaskDate;
                    if (taskData.dueDate) {
                        try {
                            taskDate = toUTCDateOnly(taskData.dueDate.slice(0, 10));
                        } catch (e) {
                            taskDate = defaultTaskDate;
                        }
                    }
                    const task = await taskService.createTask(userId, { ...taskData, taskDate });
                    await incrementUsage(userId, 'task');
                    createdTasks.push(task);
                }

                return {
                    success: true,
                    message: `Successfully created ${createdTasks.length} tasks.`,
                    tasks: createdTasks.map(t => ({ title: t.title, id: t.id }))
                };
            } catch (error) {
                console.error(`[Executor Error] create_tasks_bulk:`, error);
                return { error: true, message: `Failed to create tasks in bulk: ${error.message}` };
            }
        }

        case "create_schedule": {
            try {
                const { taskId, taskTitle, scheduleDate, startTime, endTime, recurrence, repeatUntil, repeatOnDays } = data;
                if (!scheduleDate || !startTime || !endTime) {
                    return { error: true, message: "Schedule date and times are required." };
                }

                let finalTaskId = taskId;

                // Lookup taskId by title if not provided
                if (!finalTaskId && taskTitle) {
                    const searchTitle = taskTitle.trim();
                    let foundTask = await prisma.task.findFirst({
                        where: { userId, title: { equals: searchTitle, mode: 'insensitive' }, deletedAt: null },
                        orderBy: { createdAt: 'desc' }
                    });

                    if (!foundTask) {
                        foundTask = await prisma.task.findFirst({
                            where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                            orderBy: { createdAt: 'desc' }
                        });
                    }

                    if (!foundTask) {
                        const clean = (s) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
                        const allTasks = await prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
                        const cleanedSearch = clean(searchTitle);
                        foundTask = allTasks.find(t => clean(t.title) === cleanedSearch || clean(t.title).includes(cleanedSearch) || cleanedSearch.includes(clean(t.title)));
                    }

                    if (foundTask) finalTaskId = foundTask.id;
                }

                if (!finalTaskId) {
                    return { error: true, message: `Could not find task "${taskTitle || 'unknown'}" to schedule. Please make sure the task is created first.` };
                }

                const schedule = await scheduleService.createSchedule({
                    userId,
                    taskId: finalTaskId,
                    scheduleDate,
                    startTime,
                    endTime,
                    recurrence: recurrence ?? "NONE",
                    repeatUntil: repeatUntil ?? null,
                    repeatOnDays: repeatOnDays ?? [],
                });
                await incrementUsage(userId, 'schedule');
                return { success: true, message: "Schedule created successfully.", schedule };
            } catch (error) {
                console.error(`[Executor Error] create_schedule:`, error);
                return { error: true, message: `Failed to create schedule: ${error.message}` };
            }
        }

        case "create_schedules_bulk": {
            try {
                if (!data.schedules || !Array.isArray(data.schedules)) {
                    return { error: true, message: "Invalid payload for bulk schedules creation." };
                }

                const createdSchedules = [];
                const errors = [];

                for (const item of data.schedules) {
                    const { taskId, taskTitle, scheduleDate, startTime, endTime, recurrence, repeatUntil, repeatOnDays } = item;
                    if (!scheduleDate || !startTime || !endTime) continue;

                    let finalTaskId = taskId;
                    if (!finalTaskId && taskTitle) {
                        const searchTitle = taskTitle.trim();
                        let foundTask = await prisma.task.findFirst({
                            where: { userId, title: { equals: searchTitle, mode: 'insensitive' }, deletedAt: null },
                            orderBy: { createdAt: 'desc' }
                        });

                        if (!foundTask) {
                            foundTask = await prisma.task.findFirst({
                                where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                                orderBy: { createdAt: 'desc' }
                            });
                        }

                        if (!foundTask) {
                            const clean = (s) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
                            const cleanedSearch = clean(searchTitle);
                            const allTasks = await prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 20 });
                            foundTask = allTasks.find(t => clean(t.title) === cleanedSearch || clean(t.title).includes(cleanedSearch) || cleanedSearch.includes(clean(t.title)));
                        }

                        if (foundTask) finalTaskId = foundTask.id;
                    }

                    if (finalTaskId) {
                        const schedule = await scheduleService.createSchedule({
                            userId,
                            taskId: finalTaskId,
                            scheduleDate,
                            startTime,
                            endTime,
                            recurrence: recurrence ?? "NONE",
                            repeatUntil: repeatUntil ?? null,
                            repeatOnDays: repeatOnDays ?? [],
                        });
                        await incrementUsage(userId, 'schedule');
                        createdSchedules.push(schedule);
                    } else {
                        errors.push(`"${taskTitle || 'unknown'}"`);
                    }
                }

                return {
                    success: true,
                    message: `Successfully scheduled ${createdSchedules.length} tasks.${errors.length > 0 ? ` Errors locating: ${errors.join(', ')}` : ''}`,
                    schedules: createdSchedules
                };
            } catch (error) {
                console.error(`[Executor Error] create_schedules_bulk:`, error);
                return { error: true, message: `Failed to create schedules in bulk: ${error.message}` };
            }
        }

        case "create_task_and_schedule": {
            try {
                if (!data.task || !data.schedule) {
                    return { error: true, message: "Both task and schedule data are required." };
                }

                // 1. Create Task Sequentially First
                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                let taskDate = toUTCDateOnly(localDateStr);

                if (data.task.dueDate) {
                    try {
                        taskDate = toUTCDateOnly(data.task.dueDate.slice(0, 10));
                    } catch (e) {
                        // fallback to default
                    }
                }

                const createdTask = await taskService.createTask(userId, { ...data.task, taskDate });
                await incrementUsage(userId, 'task');

                // 2. Schedule using the newly created Task's ID
                const { scheduleDate, startTime, endTime, recurrence, repeatUntil, repeatOnDays, notes } = data.schedule;
                const createdSchedule = await scheduleService.createSchedule({
                    userId,
                    taskId: createdTask.id,
                    scheduleDate,
                    startTime,
                    endTime,
                    recurrence: recurrence ?? "NONE",
                    repeatUntil: repeatUntil ?? null,
                    repeatOnDays: repeatOnDays ?? [],
                    notes: notes ?? null
                });
                await incrementUsage(userId, 'schedule');

                return {
                    success: true,
                    message: `Created task "${createdTask.title}" and scheduled it successfully.`,
                    task: createdTask,
                    schedule: createdSchedule
                };
            } catch (error) {
                console.error(`[Executor Error] create_task_and_schedule:`, error);
                return { error: true, message: `Failed to create task and schedule: ${error.message}` };
            }
        }

        case "create_task_and_schedules_bulk": {
            try {
                if (!data.items || !Array.isArray(data.items)) {
                    return { error: true, message: "Invalid payload for bulk creation." };
                }

                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                const defaultTaskDate = toUTCDateOnly(localDateStr);

                // 1. Create all tasks in parallel first
                const taskPromises = data.items.map(item => {
                    let taskDate = defaultTaskDate;
                    if (item.task?.dueDate) {
                        try {
                            taskDate = toUTCDateOnly(item.task.dueDate.slice(0, 10));
                        } catch (e) { }
                    }
                    return taskService.createTask(userId, { ...item.task, taskDate });
                });

                const createdTasks = await Promise.all(taskPromises);

                // Increment usage for all created tasks
                for (let i = 0; i < createdTasks.length; i++) {
                    await incrementUsage(userId, 'task');
                }

                // 2. Map task IDs to schedules and create them in bulk
                const schedulesToCreate = [];
                const createdSchedules = [];

                for (let i = 0; i < data.items.length; i++) {
                    const task = createdTasks[i];
                    const scheduleData = data.items[i].schedule;

                    if (task && scheduleData && scheduleData.scheduleDate && scheduleData.startTime && scheduleData.endTime) {
                        try {
                            const schedule = await scheduleService.createSchedule({
                                userId,
                                taskId: task.id,
                                scheduleDate: scheduleData.scheduleDate,
                                startTime: scheduleData.startTime,
                                endTime: scheduleData.endTime,
                                recurrence: scheduleData.recurrence ?? "NONE",
                                repeatUntil: scheduleData.repeatUntil ?? null,
                                repeatOnDays: scheduleData.repeatOnDays ?? [],
                                notes: scheduleData.notes ?? null
                            });
                            await incrementUsage(userId, 'schedule');
                            createdSchedules.push(schedule);
                        } catch (scheduleError) {
                            console.error(`Failed to schedule task ${task.id}:`, scheduleError);
                        }
                    }
                }

                return {
                    success: true,
                    message: `Successfully created and scheduled ${createdSchedules.length} items.`,
                    tasks: createdTasks.map(t => ({ id: t.id, title: t.title })),
                    schedules: createdSchedules
                };
            } catch (error) {
                console.error(`[Executor Error] create_task_and_schedules_bulk:`, error);
                return { error: true, message: `Failed to bulk create tasks and schedules: ${error.message}` };
            }
        }

        // LEGACY / READ ACTIONS
        case "UPDATE_TASK": {
            try {
                if (!data.taskId) return { error: true, message: "taskId is required to update a task." };
                const { taskId, ...updates } = data;
                const task = await taskService.updateTask(userId, taskId, updates);
                return { success: true, message: "Task updated.", task };
            } catch (error) {
                console.error(`[Executor Error] UPDATE_TASK:`, error);
                return { error: true, message: `Update failed: ${error.message}` };
            }
        }

        case "DELETE_TASK": {
            try {
                let targetTaskId = data.taskId;

                if (!targetTaskId && data.taskTitle) {
                    const searchTitle = data.taskTitle.trim();
                    let foundTask = await prisma.task.findFirst({
                        where: { userId, title: { equals: searchTitle, mode: 'insensitive' }, deletedAt: null },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (!foundTask) {
                        foundTask = await prisma.task.findFirst({
                            where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                            orderBy: { createdAt: 'desc' }
                        });
                    }
                    if (!foundTask) {
                        const clean = (s) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
                        const allTasks = await prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
                        foundTask = allTasks.find(t => clean(t.title) === clean(searchTitle) || clean(t.title).includes(clean(searchTitle)));
                    }
                    if (foundTask) targetTaskId = foundTask.id;
                }

                if (!targetTaskId) {
                    return { error: true, message: `Could not find task "${data.taskTitle || 'unknown'}" to delete.` };
                }

                await prisma.schedule.deleteMany({ where: { userId, taskId: targetTaskId } });
                await taskService.deleteTask(userId, targetTaskId);
                return { success: true, message: `Task "${data.taskTitle || ''}" and its schedules deleted successfully.` };
            } catch (error) {
                console.error(`[Executor Error] DELETE_TASK:`, error);
                return { error: true, message: `Delete failed: ${error.message}` };
            }
        }

        case "LIST_TASKS": {
            try {
                if (data.date) {
                    const timezone = config.configurable?.user?.timezone || "UTC";
                    const queryDateStr = data.date.toLowerCase() === "today"
                        ? formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
                        : toUTCDateOnly(data.date).toISOString().slice(0, 10);

                    const { getTodayDashboard } = await import("../../services/dashboard.service.js");
                    const dashOverview = await getTodayDashboard(userId, queryDateStr);

                    const scheduledItems = dashOverview.timeline.filter(t => t.type === "SCHEDULED").map(t => ({
                        title: t.title,
                        description: t.description || "",
                        priority: t.priority,
                        status: t.status,
                        time: t.startTime ? `${t.startTime} - ${t.endTime}` : "N/A"
                    }));

                    const unscheduledItems = dashOverview.timeline.filter(t => t.type === "UNSCHEDULED").map(t => ({
                        title: t.title,
                        description: t.description || "",
                        priority: t.priority,
                        status: t.status,
                        time: "Anytime Today"
                    }));

                    return {
                        success: true,
                        summary: `You have ${scheduledItems.length} specific schedules and ${unscheduledItems.length} flexible tasks for today.`,
                        schedules: scheduledItems,
                        tasks: unscheduledItems
                    };
                }

                const result = await taskService.getTasks(userId, data);
                return { success: true, tasks: result.tasks };
            } catch (error) {
                console.error(`[Executor Error] LIST_TASKS:`, error);
                return { error: true, message: `List tasks failed: ${error.message}` };
            }
        }

        case "UPDATE_SCHEDULE": {
            try {
                if (!data.scheduleId) return { error: true, message: "scheduleId is required to update a schedule." };
                const { scheduleId, ...updates } = data;
                const schedule = await scheduleService.updateSchedule(userId, scheduleId, updates);
                return { success: true, schedule };
            } catch (error) {
                console.error(`[Executor Error] UPDATE_SCHEDULE:`, error);
                return { error: true, message: `Update schedule failed: ${error.message}` };
            }
        }

        case "DELETE_SCHEDULE": {
            try {
                if (data.scheduleId) {
                    await scheduleService.deleteSchedule(userId, data.scheduleId);
                    return { success: true, message: "Schedule deleted successfully." };
                }

                if (data.taskTitle) {
                    const searchTitle = data.taskTitle.trim();
                    let foundTask = await prisma.task.findFirst({
                        where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (!foundTask) {
                        const clean = (s) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
                        const allTasks = await prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
                        foundTask = allTasks.find(t => clean(t.title).includes(clean(searchTitle)));
                    }
                    if (!foundTask) return { error: true, message: `Could not find task "${searchTitle}" to delete schedules for.` };

                    const deleted = await prisma.schedule.deleteMany({ where: { userId, taskId: foundTask.id } });
                    return { success: true, message: `Deleted ${deleted.count} schedule(s) for "${foundTask.title}".` };
                }

                return { error: true, message: "scheduleId or taskTitle is required to delete schedule." };
            } catch (error) {
                console.error(`[Executor Error] DELETE_SCHEDULE:`, error);
                return { error: true, message: `Delete schedule failed: ${error.message}` };
            }
        }

        case "DELETE_MULTIPLE_TASKS": {
            try {
                if (data.deleteAll) {
                    const deletedSchedules = await prisma.schedule.deleteMany({ where: { userId } });
                    const deletedTasks = await prisma.task.updateMany({
                        where: { userId, deletedAt: null },
                        data: { deletedAt: new Date(), isArchived: true }
                    });
                    return { success: true, message: `Deleted ${deletedTasks.count} tasks and ${deletedSchedules.count} schedules.` };
                }

                if (data.taskTitles && Array.isArray(data.taskTitles)) {
                    let deletedCount = 0;
                    const errors = [];
                    for (const title of data.taskTitles) {
                        const searchTitle = title.trim();
                        let foundTask = await prisma.task.findFirst({
                            where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                            orderBy: { createdAt: 'desc' }
                        });
                        if (!foundTask) {
                            const clean = (s) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
                            const allTasks = await prisma.task.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
                            foundTask = allTasks.find(t => clean(t.title).includes(clean(searchTitle)));
                        }
                        if (foundTask) {
                            await prisma.schedule.deleteMany({ where: { userId, taskId: foundTask.id } });
                            await taskService.deleteTask(userId, foundTask.id);
                            deletedCount++;
                        } else {
                            errors.push(`"${title}"`);
                        }
                    }
                    return { success: true, message: `Deleted ${deletedCount} tasks.${errors.length > 0 ? ` Could not find: ${errors.join(', ')}` : ''}` };
                }

                return { error: true, message: "deleteAll or taskTitles is required." };
            } catch (error) {
                console.error(`[Executor Error] DELETE_MULTIPLE_TASKS:`, error);
                return { error: true, message: `Bulk delete failed: ${error.message}` };
            }
        }

        case "DELETE_MULTIPLE_SCHEDULES": {
            try {
                if (data.deleteAll) {
                    const deleted = await prisma.schedule.deleteMany({ where: { userId } });
                    return { success: true, message: `Deleted all ${deleted.count} schedules.` };
                }

                if (data.taskTitles && Array.isArray(data.taskTitles)) {
                    let totalDeleted = 0;
                    const errors = [];
                    for (const title of data.taskTitles) {
                        const searchTitle = title.trim();
                        let foundTask = await prisma.task.findFirst({
                            where: { userId, title: { contains: searchTitle, mode: 'insensitive' }, deletedAt: null },
                            orderBy: { createdAt: 'desc' }
                        });
                        if (foundTask) {
                            const deleted = await prisma.schedule.deleteMany({ where: { userId, taskId: foundTask.id } });
                            totalDeleted += deleted.count;
                        } else {
                            errors.push(`"${title}"`);
                        }
                    }
                    return { success: true, message: `Deleted ${totalDeleted} schedules.${errors.length > 0 ? ` Could not find tasks: ${errors.join(', ')}` : ''}` };
                }

                return { error: true, message: "deleteAll or taskTitles is required." };
            } catch (error) {
                console.error(`[Executor Error] DELETE_MULTIPLE_SCHEDULES:`, error);
                return { error: true, message: `Bulk delete failed: ${error.message}` };
            }
        }

        case "LIST_SCHEDULES": {
            try {
                if (!data.from || !data.to) return { error: true, message: "from and to dates are required." };
                const calendarDays = await calendarService.getRangeCalendar(userId, data.from, data.to);
                return { success: true, data: calendarDays };
            } catch (error) {
                console.error(`[Executor Error] LIST_SCHEDULES:`, error);
                return { error: true, message: `List schedules failed: ${error.message}` };
            }
        }

        case "LOG_BEHAVIOR": {
            try {
                if (!data.date) return { error: true, message: "date is required to log behavior." };
                await prisma.behaviorLog.upsert({
                    where: {
                        userId_date: {
                            userId,
                            date: new Date(data.date),
                        },
                    },
                    update: {
                        mood: data.mood ?? undefined,
                        sleepHours: data.sleepHours ?? undefined,
                        notes: data.notes ?? undefined,
                    },
                    create: {
                        userId,
                        date: new Date(data.date),
                        mood: data.mood ?? "NEUTRAL",
                        sleepHours: data.sleepHours,
                        notes: data.notes,
                    },
                });
                return { success: true, message: "Behavior logged successfully." };
            } catch (error) {
                console.error(`[Executor Error] LOG_BEHAVIOR:`, error);
                return { error: true, message: `Log behavior failed: ${error.message}` };
            }
        }

        case "GET_DASHBOARD_SUMMARY": {
            try {
                const timezone = config.configurable?.user?.timezone || "UTC";
                const queryDateStr = (!data.date || data.date.toLowerCase() === "today")
                    ? formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
                    : toUTCDateOnly(data.date).toISOString().slice(0, 10);

                const { getDashboardOverview } = await import("../../services/dashboard.service.js");
                const dashOverview = await getDashboardOverview(userId, queryDateStr);

                return {
                    success: true,
                    summary: `For ${queryDateStr}, you have ${dashOverview.completedTasksCount} completed tasks out of ${dashOverview.todayTasksTotal} total.`,
                    productivityScore: dashOverview.productivityScore,
                    behaviorScore: dashOverview.behaviorScore,
                    currentStreak: dashOverview.currentStreak,
                    pendingTasks: dashOverview.todayTasksCount
                };
            } catch (error) {
                console.error(`[Executor Error] GET_DASHBOARD_SUMMARY:`, error);
                return { error: true, message: `Failed to load dashboard summary: ${error.message}` };
            }
        }

        case "unknown":
        case "UNKNOWN":
            return { message: "No action mapped. Please clarify." };

        default:
            return { error: true, message: `Unsupported action type requested: ${action}` };
    }
};
