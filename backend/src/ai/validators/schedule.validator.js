import { z } from "zod";

const timeStringSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format HH:mm");
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD");

// Single Schedule Schema
const singleScheduleSchema = z.object({
    taskId: z.string().uuid().optional(),
    scheduleDate: dateStringSchema,
    startTime: timeStringSchema,
    endTime: timeStringSchema,
}).refine(data => {
    // End > Start check
    return timeToMinutes(data.endTime) > timeToMinutes(data.startTime);
}, {
    message: "End time must be after start time",
    path: ["endTime"]
});

// Helper: HH:mm -> minutes
const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Validates a schedule or array of schedules.
 * Checks for:
 * 1. Schema validity (Time format, End > Start)
 * 2. Overlaps between the provided schedules (if array)
 */
export const validateSchedule = (data) => {
    // 1. Array vs Single check
    const items = Array.isArray(data) ? data : [data];

    // 2. Schema Validation
    const arraySchema = z.array(singleScheduleSchema);
    const parseResult = arraySchema.safeParse(items);

    if (!parseResult.success) {
        const errorMsg = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Schedule Validation Failed: ${errorMsg}`);
    }

    // 3. Overlap Detection (Self-check within the new batch)
    if (items.length > 1) {
        // Sort by date then start time
        const sorted = [...items].sort((a, b) => {
            if (a.scheduleDate !== b.scheduleDate) return a.scheduleDate.localeCompare(b.scheduleDate);
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });

        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];

            // Only check overlap if on same day
            if (current.scheduleDate === next.scheduleDate) {
                const currentEnd = timeToMinutes(current.endTime);
                const nextStart = timeToMinutes(next.startTime);

                if (currentEnd > nextStart) {
                    throw new Error(`Schedule Conflict: ${current.startTime}-${current.endTime} overlaps with ${next.startTime}-${next.endTime}`);
                }
            }
        }
    }

    return true; // Still return true for success, but throw on error
};
