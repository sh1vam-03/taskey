import ApiError from "../../utils/ApiError.js";

/**
 * CONFIG — single source of truth
 */
const FOCUS_MAX_MINUTES = 50;
const BREAK_MIN_MINUTES = 10;
const BREAK_MAX_MINUTES = 15;
const MIN_SLEEP_HOURS = 6;
const NIGHT_START = 22; // 10 PM
const MORNING_START = 6; // 6 AM

/**
 * Convert HH:mm to minutes since midnight
 */
const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Duration between two HH:mm times
 */
const durationMinutes = (start, end) => {
    return toMinutes(end) - toMinutes(start);
};

/**
 * Sort schedules by time
 */
const sortSchedules = (schedules) =>
    [...schedules].sort(
        (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );

/**
 * Main validator
 */
export const validateSchedules = (schedules) => {
    if (!Array.isArray(schedules) || schedules.length === 0) {
        throw new ApiError(400, "Schedules cannot be empty");
    }

    const sorted = sortSchedules(schedules);

    let totalSleepBlocked = 0;
    let lastEnd = null;

    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];

        // ───────────────────────────────
        // BASIC TIME VALIDATION
        // ───────────────────────────────
        if (!current.startTime || !current.endTime) {
            throw new ApiError(400, "Schedule time missing");
        }

        const start = toMinutes(current.startTime);
        const end = toMinutes(current.endTime);

        if (start >= end) {
            throw new ApiError(
                400,
                `Invalid time range ${current.startTime}–${current.endTime}`
            );
        }

        const duration = end - start;

        // ───────────────────────────────
        // OVERLAP CHECK
        // ───────────────────────────────
        if (lastEnd !== null && start < lastEnd) {
            throw new ApiError(
                409,
                `Schedule overlap detected at ${current.startTime}`
            );
        }

        lastEnd = end;

        // ───────────────────────────────
        // FOCUS LIMIT ENFORCEMENT
        // ───────────────────────────────
        if (current.label === "FOCUS" && duration > FOCUS_MAX_MINUTES) {
            throw new ApiError(
                400,
                `Focus block too long (${duration} min). Max allowed is ${FOCUS_MAX_MINUTES} minutes.`
            );
        }

        // ───────────────────────────────
        // BREAK VALIDATION
        // ───────────────────────────────
        if (current.label === "BREAK") {
            if (
                duration < BREAK_MIN_MINUTES ||
                duration > BREAK_MAX_MINUTES
            ) {
                throw new ApiError(
                    400,
                    `Break must be ${BREAK_MIN_MINUTES}–${BREAK_MAX_MINUTES} minutes`
                );
            }
        }

        // ───────────────────────────────
        // NIGHT SAFETY (MENTAL LOAD)
        // ───────────────────────────────
        const hour = Math.floor(start / 60);

        if (
            current.label === "FOCUS" &&
            hour >= NIGHT_START
        ) {
            throw new ApiError(
                400,
                "Heavy mental work should not be scheduled late at night"
            );
        }

        // ───────────────────────────────
        // SLEEP TRACKING
        // ───────────────────────────────
        if (current.label === "REST") {
            totalSleepBlocked += duration;
        }
    }

    // ───────────────────────────────
    // SLEEP SAFETY CHECK
    // ───────────────────────────────
    const sleepHours = totalSleepBlocked / 60;

    if (sleepHours < MIN_SLEEP_HOURS) {
        throw new ApiError(
            400,
            `Insufficient sleep planned (${sleepHours.toFixed(
                1
            )}h). Minimum ${MIN_SLEEP_HOURS}h required.`
        );
    }

    // ───────────────────────────────
    // BREAK BETWEEN FOCUS CHECK
    // ───────────────────────────────
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (
            prev.label === "FOCUS" &&
            curr.label === "FOCUS"
        ) {
            throw new ApiError(
                400,
                "Missing break between focus sessions"
            );
        }
    }

    return true;
};
