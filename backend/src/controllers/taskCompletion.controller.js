import asyncHandler from "../utils/asyncHandler.js";
import * as taskCompletionService from "../services/taskCompletion.service.js";
import ApiError from "../utils/ApiError.js";


/**
 * @route   POST /api/tasks/:id/complete
 * @desc    Complete a task
 * @access  Private
 */

export const completeTask = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    let { id } = req.params;
    let { date } = req.body;

    // Handle Composite ID (UUID-YYYY-MM-DD)
    if (id && id.length > 36) {
        const taskIdPart = id.slice(0, 36);
        const datePart = id.slice(37);

        id = taskIdPart;
        if (!date) date = datePart;
    }

    // Input Validation
    const task = await taskCompletionService.completeTask(userId, id, date);

    res.status(200).json({
        success: true,
        message: "Task completed successfully"
    });
});


/**
 * @route   DELETE /api/tasks/:id/completed
 * @desc    Undo a task completion
 * @access  Private
 */

export const undoTaskCompletion = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    let id = req.params.id;
    let date = req.body.date;

    // Handle Composite ID (UUID-YYYY-MM-DD)
    if (id && id.length > 36) {
        const taskIdPart = id.slice(0, 36);
        const datePart = id.slice(37);

        id = taskIdPart;
        if (!date) date = datePart;
    }

    if (!date) {
        throw new ApiError(400, "date is required to undo completion");
    }


    // Input Validation
    await taskCompletionService.undoTaskCompletion(userId, id, date);

    res.status(200).json({
        success: true,
        message: "Task completion undone successfully"
    });
});


/**
 * @route   GET /api/tasks/:id/completed-history
 * @desc    Get a task completion history
 * @access  Private
 */

export const getTaskCompletion = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { id: taskId } = req.params;

    const completion = await taskCompletionService.getTaskCompletionHistory(userId, taskId);

    res.status(200).json({
        success: true,
        message: "Task completion retrieved successfully",
        data: completion
    });
});

/**
 * @route   POST /api/tasks/complete-bulk
 * @desc    Complete multiple tasks
 * @access  Private
 */

export const completeBulkTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { taskIds, date } = req.body;

    // Input Validation
    const result = await taskCompletionService.completeBulkTasks(userId, taskIds, date);

    res.status(200).json({
        success: true,
        message: "Bulk tasks completed successfully",
        data: result
    });
});
