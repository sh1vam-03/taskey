import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as scheduleService from "../../services/schedule.service.js";
import * as calendarService from "../../services/calendar.service.js";
import { incrementUsage } from "../../services/usageLimit.service.js";

const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const createScheduleTool = () => new DynamicStructuredTool({
    name: "create_schedule",
    description: "Creates a schedule (time block) for an existing task. A schedule MUST be linked to a taskId. Always create the task first if it doesn't exist.",
    schema: z.object({
        taskId: z.string().describe("UUID of the task this schedule belongs to. Required. Always required."),
        scheduleDate: z.string().describe("Date of the schedule in YYYY-MM-DD format. Required."),
        startTime: z.string().describe("Start time in HH:MM:SS (24hr). Required. Ask user if not mentioned."),
        endTime: z.string().describe("End time in HH:MM:SS (24hr). Required. If user didn't mention, add 1 hour to startTime."),
        recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "NONE"]).optional().default("NONE").describe("NONE = one-time. Only change if user says daily/weekly/monthly/repeat/every day etc."),
        repeatUntil: z.string().optional().describe("YYYY-MM-DD. Only set if user mentioned an end date for recurrence. Otherwise null."),
        repeatOnDays: z.array(z.number().min(0).max(6)).optional().describe("Only for WEEKLY recurrence. Days as integers: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat. E.g. every Monday+Wednesday = [1,3]"),
        notes: z.string().optional().describe("Optional notes for this schedule slot.")
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

export const createSchedulesBulkTool = () => new DynamicStructuredTool({
    name: "create_schedules_bulk",
    description: "Creates multiple schedules at once. Use when user asks to schedule 2 or more things in one message.",
    schema: z.object({
        schedules: z.array(z.object({
            taskId: z.string().describe("UUID of the task. Required for each schedule."),
            scheduleDate: z.string().describe("YYYY-MM-DD"),
            startTime: z.string().describe("HH:MM:SS (24hr)"),
            endTime: z.string().describe("HH:MM:SS (24hr)"),
            recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "NONE"]).optional().default("NONE"),
            repeatUntil: z.string().optional(),
            repeatOnDays: z.array(z.number().min(0).max(6)).optional(),
            notes: z.string().optional()
        }))
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            // Mocking sequential creation to match a bulk endpoint logic internally
            const results = [];
            for (const sched of args.schedules) {
                const schedule = await scheduleService.createSchedule({ userId, ...sched });
                results.push(schedule);
                await incrementUsage(userId, 'schedule');
            }

            return success({ message: `Created ${results.length} schedules successfully`, schedules: results });
        } catch (e) {
            return error(`Error creating batch schedules: ${e.message}`);
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
