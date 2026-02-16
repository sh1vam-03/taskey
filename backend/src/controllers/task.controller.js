import * as taskService from "../services/task.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { TaskPriority } from "@prisma/client";
import { checkUsageLimit, incrementUsage } from "../services/usageLimit.service.js";
import { toUTCDateOnly, startOfUTCDate } from "../utils/date.utils.js";
import { formatInTimeZone } from 'date-fns-tz';

/**
 * @route   POST /api/tasks
 * @desc    Create a task
 * @access  Private
 */

export const createTask = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { title, description, priority, dueDate, categoryId } = req.body;

    console.log("DEBUG CREATE TASK");
    console.log("Body:", req.body);
    console.log("User Timezone:", req.user.timezone);

    // Sanitize categoryId (empty string -> null)
    const sanitizedCategoryId = categoryId && categoryId !== "" ? categoryId : null;

    // Sanitize dueDate
    let validDueDate = dueDate;
    if (dueDate === "null" || dueDate === "") validDueDate = null;

    if (!title || !title.trim()) {
        throw new ApiError(400, "Title is required");
    }

    if (priority && !Object.values(TaskPriority).includes(priority)) {
        throw new ApiError(400, "Invalid priority");
    }

    // Validate dueDate is not in the past (UTC-safe)
    if (validDueDate) {
        const dueDateObj = toUTCDateOnly(validDueDate);

        if (isNaN(dueDateObj.getTime())) {
            throw new ApiError(400, "Invalid due date format");
        }

        const today = startOfUTCDate();

        if (dueDateObj < today) {
            throw new ApiError(400, "Due date cannot be in the past");
        }
    }

    // Check Limit
    await checkUsageLimit(userId, 'task');

    // Calculate taskDate (Calendar Day)
    let taskDate;
    if (req.body.taskDate) {
        // Frontend provided specific date (e.g. "2026-02-17")
        taskDate = toUTCDateOnly(req.body.taskDate);
    } else {
        // Default to User's "Today"
        // Get User's local YYYY-MM-DD
        const timezone = req.user.timezone || "UTC";
        const localDateStr = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
        taskDate = toUTCDateOnly(localDateStr);
    }

    const task = await taskService.createTask(userId, {
        title,
        description,
        priority,
        dueDate,
        taskDate, // Pass calculated taskDate
        categoryId: sanitizedCategoryId,
        userId
    });

    // Increment Usage
    await incrementUsage(userId, 'task');

    res.status(201).json(task);
});


/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Private
 */

export const getTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT

    // Input Validation
    const result = await taskService.getTasks(userId, req.query);

    res.status(200).json(result);
});


/**
 * @route   GET /api/tasks/:id
 * @desc    Get a task
 * @access  Private
 */

export const getTask = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { id } = req.params;

    // Input Validation
    const task = await taskService.getTask(userId, id);

    res.status(200).json(task);
});


/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */

export const updateTask = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { id } = req.params;

    // Input Validation
    const task = await taskService.updateTask(userId, id, req.body);

    res.status(200).json(task);
});



/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */

export const deleteTask = asyncHandler(async (req, res) => {
    const userId = req.user.id; //From JWT
    const { id } = req.params;

    // Input Validation
    await taskService.deleteTask(userId, id);

    res.status(200).json({
        success: true,
        message: "Task deleted successfully"
    });
});
