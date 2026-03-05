import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as scheduleService from "../../services/schedule.service.js";
import * as calendarService from "../../services/calendar.service.js";
import { incrementUsage } from "../../services/usageLimit.service.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const createScheduleTool = () => new DynamicStructuredTool({
    name: "create_schedule",
    description: "Schedule a task for a specific time.",
    schema: z.object({
        taskId: z.string().describe("The ID of the task to schedule"),
        scheduleDate: z.string().describe("Date YYYY-MM-DD"),
        startTime: z.string().describe("Start time HH:mm"),
        endTime: z.string().describe("End time HH:mm"),
        recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "NONE"]).optional().describe("Recurrence type"),
        repeatUntil: z.string().optional().describe("End date for recurrence YYYY-MM-DD"),
        repeatOnDays: z.array(z.number().min(0).max(6)).optional().describe("For WEEKLY: 0=Sun, 1=Mon, etc."),
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const schedule = await scheduleService.createSchedule({ userId, ...args });
            await incrementUsage(userId, 'schedule');
            return success(schedule);
        } catch (e) {
            return error(`Error scheduling task: ${e.message}`);
        }
    }
});

export const updateScheduleTool = () => new DynamicStructuredTool({
    name: "update_schedule",
    description: "Update an existing schedule.",
    schema: z.object({
        scheduleId: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        scheduleDate: z.string().optional(),
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const { scheduleId, ...updates } = args;
            const schedule = await scheduleService.updateSchedule(userId, scheduleId, updates);
            return success(schedule);
        } catch (e) {
            return error(`Error updating schedule: ${e.message}`);
        }
    }
});

export const deleteScheduleTool = () => new DynamicStructuredTool({
    name: "delete_schedule",
    description: "Delete a schedule.",
    schema: z.object({
        scheduleId: z.string(),
    }),
    func: async ({ scheduleId }, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            await scheduleService.deleteSchedule(userId, scheduleId);
            return success({ message: "Schedule deleted successfully" });
        } catch (e) {
            return error(`Error deleting schedule: ${e.message}`);
        }
    }
});

export const listSchedulesTool = () => new DynamicStructuredTool({
    name: "list_schedules",
    description: "List scheduled tasks for a specific date range. VERY USEFUL for answering questions about 'today', 'tomorrow', 'next week', or any schedule queries.",
    schema: z.object({
        from: z.string().describe("Start date strictly in YYYY-MM-DD format"),
        to: z.string().describe("End date strictly in YYYY-MM-DD format"),
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            if (!args.from || !args.to) {
                return error("Both 'from' and 'to' dates (YYYY-MM-DD) are strictly required.");
            }

            console.log(`[AI_SCHEDULE_TOOL] Triggered for range: ${args.from} to ${args.to} for user ${userId}`);

            const calendarDays = await calendarService.getRangeCalendar(userId, args.from, args.to);
            return success(calendarDays);
        } catch (e) {
            return error(`Error fetching schedules: ${e.message}`);
        }
    }
});
