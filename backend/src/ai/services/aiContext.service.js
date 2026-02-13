import prisma from "../../config/db.js";
import { getRecentBehaviors, formatBehaviorContext } from "../memory/behavior.memory.js";
import { getLastSummary } from "../memory/summary.store.js";
import systemPrompt from "../prompts/system.prompt.js";
import { getTasks } from "../../services/task.service.js";
import { getSchedules } from "../../services/schedule.service.js";

/**
 * Builds the full System Prompt with injected context.
 * Orchestrates: Profile + Behavior + Conversation Summary + System Rules + Real-time Workload
 */
export const buildSystemContext = async (userId, user, conversationId = null) => {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // 1. Parallel Data Fetching
    const [behaviorLogs, summary, taskData, scheduleData] = await Promise.all([
        getRecentBehaviors(userId),
        getLastSummary(conversationId),
        getTasks(userId, { isArchived: 'false', limit: 10, sortBy: 'priority', sortOrder: 'desc' }),
        getSchedules(userId, todayStart, todayEnd)
    ]);

    // 2. Format Contexts
    const behaviorContext = formatBehaviorContext(behaviorLogs);

    // Format Tasks
    const pendingTasks = taskData.tasks.filter(t => t.dailyCompletions.length === 0);
    const taskContext = pendingTasks.length > 0
        ? `Pending Tasks (Top ${pendingTasks.length}):\n` + pendingTasks.map(t =>
            `- [${t.priority}] ${t.title} ${t.dueDate ? `(Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`
        ).join("\n")
        : "No pending tasks for today.";

    // Format Schedule
    const scheduleContext = scheduleData.length > 0
        ? `Today's Schedule:\n` + scheduleData.map(s =>
            `- ${s.startTime} - ${s.endTime}: ${s.title} (${s.status})`
        ).join("\n")
        : "No schedule blocks for today.";

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
Current Date: ${new Date().toISOString().split('T')[0]} 
Current Time: ${new Date().toLocaleTimeString('en-US', { timeZone: user?.timezone || "UTC", hour: '2-digit', minute: '2-digit' })}

${behaviorContext}

━━━━━━━━━━━━━━━━━━━━━━
CURRENT WORKLOAD (REAL-TIME)
━━━━━━━━━━━━━━━━━━━━━━
${taskContext}

${scheduleContext}
`;

    return finalSystemPrompt;
};
