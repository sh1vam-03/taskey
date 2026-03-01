import * as taskService from "../../services/task.service.js";
import * as scheduleService from "../../services/schedule.service.js";
import * as calendarService from "../../services/calendar.service.js";
import prisma from "../../config/db.js";
import { incrementUsage } from "../../services/usageLimit.service.js";
import { formatInTimeZone } from 'date-fns-tz';
import { toUTCDateOnly } from "../../utils/date.utils.js";
import {
    CreateTaskSchema, UpdateTaskSchema, DeleteTaskSchema, ListTasksSchema,
    CreateScheduleSchema, UpdateScheduleSchema, DeleteScheduleSchema, ListSchedulesSchema,
    LogBehaviorSchema
} from "./schema.js";

/**
 * Validates 'data' against the Zod schema and maps the string 'action'
 * to our backend services (acting as manual tool execution).
 */
export const executeAction = async (action, data, config) => {
    const userId = config.configurable?.user?.id || config.configurable?.userId;
    if (!userId) throw new Error("User ID missing in configuration");

    try {
        switch (action) {
            case "CREATE_TASK": {
                if (!data.title) throw new Error("Title is required for CREATE_TASK");

                // Calculate taskDate in user's timezone exactly like the API controller does
                // This prevents tasks from appearing on the previous day if user's local day > UTC day
                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                const taskDate = toUTCDateOnly(localDateStr);

                const task = await taskService.createTask(userId, { ...data, taskDate });
                await incrementUsage(userId, 'task');
                return task;
            }
            case "CREATE_MULTIPLE_TASKS": {
                if (!data.tasks || !Array.isArray(data.tasks)) {
                    throw new Error("Tasks array is required for CREATE_MULTIPLE_TASKS");
                }

                const timezone = config.configurable?.user?.timezone || "UTC";
                const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
                const defaultTaskDate = toUTCDateOnly(localDateStr);

                const createdTasks = [];
                for (const taskData of data.tasks) {
                    if (!taskData.title) continue;

                    // If task has its own dueDate, use it to calculate taskDate, else use today
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
                    message: `Successfully created ${createdTasks.length} tasks.`,
                    tasks: createdTasks.map(t => ({ title: t.title, id: t.id }))
                };
            }
            case "UPDATE_TASK": {
                if (!data.taskId) throw new Error("taskId is required for UPDATE_TASK");
                const { taskId, ...updates } = data;
                const task = await taskService.updateTask(userId, taskId, updates);
                return task;
            }
            case "DELETE_TASK": {
                if (!data.taskId) throw new Error("taskId is required for DELETE_TASK");
                await taskService.deleteTask(userId, data.taskId);
                return { message: "Task deleted successfully" };
            }
            case "LIST_TASKS": {
                if (data.date) {
                    // Extract exact "Today" local date based on user's timezone
                    const timezone = config.configurable?.user?.timezone || "UTC";
                    // If the user said "today", or gave a specific day, we still use local matching for dashboard timeline
                    const queryDateStr = data.date.toLowerCase() === "today"
                        ? formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
                        : toUTCDateOnly(data.date).toISOString().slice(0, 10);

                    // Import dynamically to avoid circular dependencies if any
                    const { getTodayDashboard } = await import("../../services/dashboard.service.js");
                    const dashOverview = await getTodayDashboard(userId, queryDateStr);

                    // Condense output explicitly for the AI to reduce context clutter
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
                        summary: `You have ${scheduledItems.length} specific schedules and ${unscheduledItems.length} flexible tasks for today.`,
                        schedules: scheduledItems,
                        tasks: unscheduledItems
                    };
                }

                // Default standard DB lookup for overarching queries
                const result = await taskService.getTasks(userId, data);
                return result.tasks;
            }

            case "CREATE_SCHEDULE": {
                if (!data.taskId || !data.scheduleDate || !data.startTime || !data.endTime) {
                    throw new Error("taskId, scheduleDate, startTime, and endTime are required for CREATE_SCHEDULE");
                }
                const schedule = await scheduleService.createSchedule({ userId, ...data });
                await incrementUsage(userId, 'schedule');
                return schedule;
            }
            case "UPDATE_SCHEDULE": {
                if (!data.scheduleId) throw new Error("scheduleId is required for UPDATE_SCHEDULE");
                const { scheduleId, ...updates } = data;
                const schedule = await scheduleService.updateSchedule(userId, scheduleId, updates);
                return schedule;
            }
            case "DELETE_SCHEDULE": {
                if (!data.scheduleId && !data.taskId) throw new Error("scheduleId or taskId is required for DELETE_SCHEDULE");
                await scheduleService.deleteSchedule(userId, data.taskId || data.scheduleId); // Fallback for bad LLM
                return { message: "Schedule deleted successfully" };
            }
            case "LIST_SCHEDULES": {
                if (!data.from || !data.to) throw new Error("from and to dates are required for LIST_SCHEDULES");
                const calendarDays = await calendarService.getRangeCalendar(userId, data.from, data.to);
                return calendarDays;
            }

            case "LOG_BEHAVIOR": {
                if (!data.date) throw new Error("date is required for LOG_BEHAVIOR");
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
                return { message: "Behavior logged successfully." };
            }

            case "GET_DASHBOARD_SUMMARY": {
                const timezone = config.configurable?.user?.timezone || "UTC";
                const queryDateStr = (!data.date || data.date.toLowerCase() === "today")
                    ? formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd')
                    : toUTCDateOnly(data.date).toISOString().slice(0, 10);

                const { getDashboardOverview } = await import("../../services/dashboard.service.js");
                const dashOverview = await getDashboardOverview(userId, queryDateStr);

                return {
                    summary: `For ${queryDateStr}, you have ${dashOverview.completedTasksCount} completed tasks out of ${dashOverview.todayTasksTotal} total.`,
                    productivityScore: dashOverview.productivityScore,
                    behaviorScore: dashOverview.behaviorScore,
                    currentStreak: dashOverview.currentStreak,
                    pendingTasks: dashOverview.todayTasksCount
                };
            }

            case "UNKNOWN":
                // This shouldn't be executed directly since validationNode bypasses
                return { message: "No action mapped" };

            default:
                throw new Error(`Unsupported action type: ${action}`);
        }
    } catch (error) {
        // Zod validation errors or Service execution errors
        throw new Error(`Action Execution Failed (${action}): ${error.message}`);
    }
};
