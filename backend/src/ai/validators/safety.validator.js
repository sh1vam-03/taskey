// Prevent harmful habits

import ApiError from "../../utils/ApiError.js";

/**
 * Safety validator for AI generated plans
 */
export function validateSafety(plan) {
    if (!plan || !Array.isArray(plan.schedules)) {
        throw new ApiError(400, "Invalid AI plan format");
    }

    let continuousFocus = 0;
    let unhealthyMinutes = 0;
    let totalFocusMinutes = 0;

    for (const slot of plan.schedules) {
        const start = toMinutes(slot.startTime);
        const end = toMinutes(slot.endTime);
        const duration = end - start;

        if (duration <= 0) {
            throw new ApiError(400, "Invalid time range detected");
        }

        // Focus tracking
        if (slot.label === "FOCUS") {
            continuousFocus += duration;
            totalFocusMinutes += duration;

            if (continuousFocus > 50) {
                throw new ApiError(
                    403,
                    "Unsafe plan: Focus exceeds human limit (50 minutes)"
                );
            }
        } else {
            continuousFocus = 0;
        }

        // Unhealthy activity detection
        if (
            slot.taskTitle?.toLowerCase().includes("game") ||
            slot.taskTitle?.toLowerCase().includes("reel") ||
            slot.taskTitle?.toLowerCase().includes("scroll")
        ) {
            unhealthyMinutes += duration;
        }

        // Night heavy work protection
        if (slot.label === "FOCUS" && start >= 22 * 60) {
            throw new ApiError(
                403,
                "Unsafe plan: Heavy mental work scheduled late at night"
            );
        }
    }

    // Addiction prevention
    if (unhealthyMinutes >= 180) {
        throw new ApiError(
            403,
            "Unsafe plan: Excessive unhealthy activity detected"
        );
    }

    // Burnout prevention
    if (totalFocusMinutes >= 8 * 60) {
        throw new ApiError(
            403,
            "Unsafe plan: Excessive total focus time (burnout risk)"
        );
    }

    return true;
}

/* ---------------- Helpers ---------------- */

function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
