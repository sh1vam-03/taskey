import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as scheduleService from "../../services/schedule.service.js";

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
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const schedule = await scheduleService.createSchedule({ userId, ...args });
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
