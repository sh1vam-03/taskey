import prisma from "../../config/db.js";
import { getRecentBehaviors, formatBehaviorContext } from "../memory/behavior.memory.js";
import { getLastSummary } from "../memory/summary.store.js";
import systemPrompt from "../prompts/system.prompt.js";

/**
 * Builds the full System Prompt with injected context.
 * Orchestrates: Profile + Behavior + Conversation Summary + System Rules
 */
export const buildSystemContext = async (userId, user, conversationId = null) => {
    // 1. Parallel Data Fetching
    const [behaviorLogs, summary] = await Promise.all([
        getRecentBehaviors(userId),
        getLastSummary(conversationId)
    ]);

    const behaviorContext = formatBehaviorContext(behaviorLogs);

    // 2. Format Summary Section
    let summarySection = "";
    if (summary) {
        summarySection = `
━━━━━━━━━━━━━━━━━━━━━━
PREVIOUS CONTEXT (MEMORY)
━━━━━━━━━━━━━━━━━━━━━━
${summary}
`;
    }

    // 3. Construct Dynamic Prompt
    // We use data from the 'user' object passed in (which should include Plan/Timezone)
    // If 'user' is null, we fetch minimal details? No, controller should provide 'user'.

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
`;

    return finalSystemPrompt;
};
