import prisma from "../../config/db.js";
import { getRecentBehaviors, formatBehaviorContext } from "../memory/behavior.memory.js";
import { getLastSummary } from "../memory/summary.store.js";
import systemPrompt from "../prompts/system.prompt.js";
import { getDashboardOverview } from "../../services/dashboard.service.js";

import { formatInTimeZone } from 'date-fns-tz';

/**
 * Builds the full System Prompt with injected context.
 * Orchestrates: Profile + Behavior + Conversation Summary + System Rules + Real-time Workload
 */
export const buildSystemContext = async (userId, user, conversationId = null) => {
    const timeZone = user?.timezone || "UTC";

    // 1. Get the current date string explicitly in the user's configured timezone
    const userLocalDateString = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');

    // 2. Parallel Data Fetching with Fault Tolerance
    const results = await Promise.allSettled([
        getRecentBehaviors(userId),
        getLastSummary(conversationId),
        getDashboardOverview(userId, userLocalDateString)
    ]);

    const behaviorLogs = results[0].status === 'fulfilled' ? results[0].value : [];
    const summary = results[1].status === 'fulfilled' ? results[1].value : null;
    const dashboard = results[2].status === 'fulfilled' ? results[2].value : null;

    // Log warnings if any service failed
    if (results.some(r => r.status === 'rejected')) {
        console.warn("[AI Context] Partial data failure:", results.filter(r => r.status === 'rejected').map(r => r.reason.message));
    }

    // 2. Format Contexts
    const behaviorContext = formatBehaviorContext(behaviorLogs);

    let workloadContext = "No workload data available.";
    if (dashboard) {
        const timeline = dashboard.timeline || [];
        const pendingItems = timeline.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE');

        const scheduleContext = pendingItems.length > 0
            ? `Pending Items for Today (${pendingItems.length}):\n` + pendingItems.map(t => {
                const timeStr = t.startTime ? `${t.startTime} - ${t.endTime}` : (t.type === "UNSCHEDULED" ? "Anytime Today" : "");
                return `- [${t.priority || "NORMAL"}] ${t.title} ${timeStr ? `(${timeStr} Local Time)` : ""}`;
            }).join("\n")
            : "No pending tasks or schedules for the rest of today.";

        workloadContext = `Daily Stats:\n- Total Today: ${dashboard.todayTasksTotal}\n- Completed: ${dashboard.completedTasksCount}\n- Pending: ${dashboard.todayTasksCount}\n- Current Streak: ${dashboard.currentStreak} days\n\n${scheduleContext}\n\nNote: All times listed above are already converted to the user's local timezone (${timeZone}).`;
    }

    // 3. Format Summary Section
    let summarySection = "";
    if (summary) {
        summarySection = `
━━━━━━━━━━━━━━━━━━━━━━
PREVIOUS CONTEXT (MEMORY)
━━━━━━━━━━━━━━━━━━━━━━
${summary}
`;
    }

    // 4. Construct Dynamic Prompt
    const finalSystemPrompt = `${systemPrompt}

${summarySection}

━━━━━━━━━━━━━━━━━━━━━━
USER LIVE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━
Name: ${user?.name || "User"}
Timezone: ${user?.timezone || "UTC"}
Current Date: ${userLocalDateString}
Current Time: ${new Date().toLocaleTimeString('en-US', { timeZone: timeZone, hour: '2-digit', minute: '2-digit' })}

${behaviorContext}

━━━━━━━━━━━━━━━━━━━━━━
CURRENT WORKLOAD (TODAY'S DASHBOARD)
━━━━━━━━━━━━━━━━━━━━━━
${workloadContext}
`;

    return finalSystemPrompt;
};
