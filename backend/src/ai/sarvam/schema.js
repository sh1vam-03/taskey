import { z } from "zod";

/**
 * Enhanced state schema for Sarvam Manual Routing.
 * Extends the basic LangGraph messages channel with routing-specific fields.
 */
export const sarvamState = {
    messages: {
        reducer: (a, b) => a.concat(b),
        default: () => [],
    },
    parsedIntent: {
        reducer: (a, b) => b ?? a, // Keep latest
        default: () => null,
    },
    actionResult: {
        reducer: (a, b) => b ?? a, // Keep latest
        default: () => null,
    },
    routingError: {
        reducer: (a, b) => b ?? a, // Keep latest
        default: () => null,
    }
};

/**
 * Zod schemas for validating the JSON output from Sarvam.
 */

export const ActionTypeSchema = z.enum([
    "CREATE_TASK",
    "UPDATE_TASK",
    "DELETE_TASK",
    "LIST_TASKS",
    "CREATE_SCHEDULE",
    "UPDATE_SCHEDULE",
    "DELETE_SCHEDULE",
    "LIST_SCHEDULES",
    "LOG_BEHAVIOR",
    "GET_DASHBOARD_SUMMARY",
    "UNKNOWN"
]);

export const CreateTaskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().optional().describe("YYYY-MM-DD or ISO string"),
});

export const UpdateTaskSchema = z.object({
    taskId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().optional(),
    isCompleted: z.boolean().optional(),
});

export const DeleteTaskSchema = z.object({
    taskId: z.string()
});

export const ListTasksSchema = z.object({
    search: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    limit: z.number().optional()
});

export const CreateScheduleSchema = z.object({
    taskId: z.string(),
    scheduleDate: z.string().describe("YYYY-MM-DD"),
    startTime: z.string().describe("HH:mm"),
    endTime: z.string().describe("HH:mm"),
});

export const UpdateScheduleSchema = z.object({
    scheduleId: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    scheduleDate: z.string().optional(),
});

export const DeleteScheduleSchema = z.object({
    scheduleId: z.string()
});

// Used heavily to answer "what is on my schedule today?"
export const ListSchedulesSchema = z.object({
    from: z.string().describe("YYYY-MM-DD"),
    to: z.string().describe("YYYY-MM-DD")
});

export const LogBehaviorSchema = z.object({
    date: z.string().describe("YYYY-MM-DD"),
    mood: z.enum(["HAPPY", "NEUTRAL", "SAD"]).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    notes: z.string().optional(),
});

export const GetDashboardSummarySchema = z.object({
    date: z.string().optional()
});

// The wrapper schema that Sarvam MUST return
export const SarvamIntentSchema = z.object({
    thought: z.string().describe("A brief explanation of why this action was chosen based on the user's message."),
    action: ActionTypeSchema,
    data: z.record(z.unknown()).optional().describe("The payload matching the action type. Empty if UNKNOWN.")
});
