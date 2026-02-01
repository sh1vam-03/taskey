// Create schedules (time slots)

import * as scheduleService from "../../services/schedule.service.js";
import ApiError from "../../utils/ApiError.js";

export async function createScheduleTool({ userId, schedule }) {
    const required = ["taskId", "scheduleDate", "startTime", "endTime"];

    for (const field of required) {
        if (!schedule[field]) {
            throw new ApiError(400, `${field} is required`);
        }
    }

    return scheduleService.createSchedule({
        userId,
        taskId: schedule.taskId,
        scheduleDate: schedule.scheduleDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        recurrence: schedule.recurrence ?? "NONE",
        repeatUntil: schedule.repeatUntil ?? null,
        repeatOnDays: schedule.repeatOnDays ?? [],
        notes: schedule.notes ?? null,
    });
}
