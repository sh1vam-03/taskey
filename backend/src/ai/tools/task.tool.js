import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as taskService from "../../services/task.service.js";
import { incrementUsage } from "../../services/usageLimit.service.js";

// HELPER
const success = (data) => JSON.stringify({ success: true, data });
const error = (msg) => JSON.stringify({ success: false, error: msg });

export const createTaskTool = () => new DynamicStructuredTool({
    name: "create_task",
    description: "Create a new task.",
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        dueDate: z.string().optional(),
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const task = await taskService.createTask(userId, args);
            await incrementUsage(userId, 'task');
            return success(task);
        } catch (e) {
            return error(`Error creating task: ${e.message}`);
        }
    },
});

export const updateTaskTool = () => new DynamicStructuredTool({
    name: "update_task",
    description: "Update an existing task.",
    schema: z.object({
        taskId: z.string().describe("The ID of the task to update"),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        dueDate: z.string().optional(),
        isCompleted: z.boolean().optional(),
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const { taskId, ...updates } = args;
            const task = await taskService.updateTask(userId, taskId, updates);
            return success(task);
        } catch (e) {
            return error(`Error updating task: ${e.message}`);
        }
    }
});

export const deleteTaskTool = () => new DynamicStructuredTool({
    name: "delete_task",
    description: "Delete a task.",
    schema: z.object({
        taskId: z.string(),
    }),
    func: async ({ taskId }, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            await taskService.deleteTask(userId, taskId);
            return success({ message: "Task deleted successfully" });
        } catch (e) {
            return error(`Error deleting task: ${e.message}`);
        }
    }
});

export const listTasksTool = () => new DynamicStructuredTool({
    name: "list_tasks",
    description: "List tasks. Can filter by search, priority, etc.",
    schema: z.object({
        search: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        limit: z.number().optional()
    }),
    func: async (args, config) => {
        try {
            const userId = config.configurable?.user?.id || config.configurable?.userId;
            if (!userId) return error("User ID missing in configuration");

            const result = await taskService.getTasks(userId, args);
            return success(result.tasks);
        } catch (e) {
            return error(`Error listing tasks: ${e.message}`);
        }
    }
});
