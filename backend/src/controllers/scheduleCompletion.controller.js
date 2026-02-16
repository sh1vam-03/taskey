import * as service from "../services/scheduleCompletion.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const completeSchedule = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    let { id } = req.params;
    let { date } = req.body; // Extract date

    // Handle Composite ID (UUID-YYYY-MM-DD)
    // If id length > 36 (UUID is 36), it likely contains date
    if (id && id.length > 36) {
        // Expected format: UUID(36)-YYYY-MM-DD
        const scheduleIdPart = id.slice(0, 36);
        const datePart = id.slice(37); // Skip hyphen

        id = scheduleIdPart;
        // Prefer date from body, fallback to ID date
        if (!date) date = datePart;
    }

    const data = await service.completeSchedule(id, userId, date);

    res.status(201).json({
        success: true,
        message: "Schedule marked as completed",
        data
    });
});

export const undoCompleteSchedule = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    let { id } = req.params;
    let { date } = req.body; // Extract date

    // Handle Composite ID (UUID-YYYY-MM-DD)
    if (id && id.length > 36) {
        const scheduleIdPart = id.slice(0, 36);
        const datePart = id.slice(37);

        id = scheduleIdPart;
        if (!date) date = datePart;
    }

    await service.undoCompleteSchedule(id, userId, date);

    res.json({
        success: true,
        message: "Schedule completion undone"
    });
});

export const completeBulk = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { scheduleIds } = req.body;

    if (!Array.isArray(scheduleIds) || !scheduleIds.length) {
        throw new ApiError(400, "scheduleIds must be a non-empty array");
    }

    const result = await service.completeBulk(scheduleIds, userId);

    res.status(201).json({
        success: true,
        message: "Schedules completed successfully",
        data: result
    });
});

export const getCompletionHistory = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;

    const history = await service.getCompletionHistory(userId);

    res.json({
        success: true,
        data: history
    });
});
