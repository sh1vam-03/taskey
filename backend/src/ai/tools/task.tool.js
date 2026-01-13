import * as taskService from "../../services/task.service.js";
import ApiError from "../../utils/ApiError.js";

export async function createTaskTool({ userId, task }) {
    if (!task?.title) {
        throw new ApiError(400, "Task title is required");
    }

    return taskService.createTask(userId, {
        title: task.title,
        description: task.description ?? null,
        priority: task.priority ?? "MEDIUM",
        dueDate: task.dueDate ?? null,
        categoryId: task.categoryId ?? null,
    });
}
