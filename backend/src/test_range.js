import { getRangeCalendar } from "./services/calendar.service.js";

async function test() {
    // Hardcoded user ID from earlier tests
    const userId = "a552736b-6fc7-44c6-8acf-ba6ddf561eee";

    console.log(`\nRunning getRangeCalendar for user ${userId} for March 01 to March 07...`);
    const calendarDays = await getRangeCalendar(userId, "2026-03-01", "2026-03-07");

    for (const [dateStr, items] of Object.entries(calendarDays)) {
        if (items.length > 0) {
            console.log(`\n--- ${dateStr} ---`);
            items.forEach(item => {
                console.log(`[${item.priority}] ${item.title} (${item.type})`);
                if (item.type === "SCHEDULED") {
                    console.log(`  Time: ${item.startTime} - ${item.endTime}`);
                    console.log(`  Recurrence: ${item.recurrence} (Ends: ${item.repeatUntil})`);
                } else {
                    console.log(`  TaskDate: ${item.taskDate} DueDate: ${item.dueDate}`);
                }
            });
        }
    }
}

test().catch(console.error).finally(() => process.exit(0));
