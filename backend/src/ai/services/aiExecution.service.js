import prisma from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { validateSchedules } from "../validators/schedule.validator.js";
import { validateSafety } from "../validators/safety.validator.js";
import { deductAiTokens } from "./aiToken.service.js";

/**
 * Converts AI JSON → DB writes
 * This is the SINGLE source of truth for AI execution
 */
export const executeAiPlan = async ({
    user,
    aiResult,
    aiUsageType = "CHAT",
    userMessage = "", // [NEW] User input
}) => {
    if (!aiResult || typeof aiResult !== "object") {
        throw new ApiError(400, "Invalid AI response");
    }

    const { tasks = [], schedules = [] } = aiResult;

    if (!Array.isArray(tasks) || !Array.isArray(schedules)) {
        throw new ApiError(400, "AI output structure invalid");
    }

    // 1️⃣ Safety validation
    validateSafety(aiResult);

    // 2️⃣ Schedule sanity validation
    validateSchedules(schedules);

    // 3️⃣ Atomic execution
    return prisma.$transaction(async (tx) => {
        // 3.1 Deduct tokens
        if (estimatedTokens > 0) {
            await deductAiTokens({
                tx,
                userId: user.id,
                tokens: estimatedTokens,
                type: aiUsageType,
            });
        }

        // 3.2 Save Chat History (Atomic)
        if (userMessage) {
            // User message
            await tx.aiChatMessage.create({
                data: {
                    userId: user.id,
                    role: "USER",
                    content: userMessage,
                    tokensUsed: 0, // Input tokens usually negligible or included in total
                },
            });

            // Assistant reply
            await tx.aiChatMessage.create({
                data: {
                    userId: user.id,
                    role: "ASSISTANT",
                    content: aiResult.summary || "Action completed.",
                    tokensUsed: estimatedTokens,
                },
            });
        }

        // 3.3 Create tasks
        const taskIdMap = new Map();

        for (const task of tasks) {
            const createdTask = await tx.task.create({
                data: {
                    userId: user.id,
                    title: task.title.trim(),
                    description: task.description ?? null,
                },
            });

            taskIdMap.set(task.title, createdTask.id);
        }

        // 3.4 Create schedules
        for (const slot of schedules) {
            const taskId = taskIdMap.get(slot.taskTitle);

            if (!taskId) {
                throw new ApiError(
                    400,
                    `Schedule references unknown task: ${slot.taskTitle}`
                );
            }

            await tx.schedule.create({
                data: {
                    userId: user.id,
                    taskId,
                    scheduleDate: new Date(),
                    startTime: parseTime(slot.startTime),
                    endTime: parseTime(slot.endTime),
                    notes: slot.label,
                },
            });
        }

        return {
            success: true,
            createdTasks: tasks.length,
            createdSchedules: schedules.length,
        };
    });
};

/* -------------------- Helpers -------------------- */

const parseTime = (time) => {
    const [h, m] = time.split(":").map(Number);

    if (
        Number.isNaN(h) ||
        Number.isNaN(m) ||
        h < 0 ||
        h > 23 ||
        m < 0 ||
        m > 59
    ) {
        throw new ApiError(400, `Invalid time format: ${time}`);
    }

    return new Date(`1970-01-01T${time}:00`);
};

