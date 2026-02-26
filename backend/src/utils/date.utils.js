// Always create UTC midnight date safely
import { fromZonedTime } from 'date-fns-tz';

export const startOfUserDayUTC = (date = new Date(), timezone = "UTC") => {
    // 1. Convert input date (UTC) to User's Local Time string
    // 2. Create a Date object that LOOKS like the local time
    // 3. Set that Date object to midnight
    // 4. Convert that "Local Midnight" back to proper UTC timestamp

    const localString = date.toLocaleString("en-US", { timeZone: timezone });
    const localMidnight = new Date(localString);
    localMidnight.setHours(0, 0, 0, 0);

    return fromZonedTime(localMidnight, timezone);
};

export const toUTCDateOnly = (input) => {
    // input must be "YYYY-MM-DD"
    // Handle Date object case just in case
    if (input instanceof Date) {
        return new Date(Date.UTC(
            input.getUTCFullYear(),
            input.getUTCMonth(),
            input.getUTCDate()
        ));
    }

    // Handle string (YYYY-MM-DD or ISO)
    const dateStr = String(input).slice(0, 10); // Take first 10 chars
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

export const startOfUTCDate = (d = new Date()) =>
    new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate()
    ));

export const dayKey = (d) =>
    startOfUTCDate(d).toISOString().slice(0, 10);

export const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getUTCMonth() + 1,
        year: now.getUTCFullYear(),
    };
};

export const getWeekRange = (date) => {
    const d = startOfUTCDate(date);
    const day = d.getUTCDay();

    const monday = new Date(d);
    // Calculate Monday: if Sunday (0), go back 6 days; otherwise go back day-1
    const diffToMonday = day === 0 ? 6 : day - 1;
    monday.setUTCDate(d.getUTCDate() - diffToMonday);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    return { weekStart: monday, weekEnd: sunday };
};

export const appliesOnDate = (schedule, date) => {
    const sDate = startOfUTCDate(schedule.scheduleDate);
    const cDate = startOfUTCDate(date);

    if (cDate < sDate) return false;
    if (schedule.repeatUntil && cDate > startOfUTCDate(schedule.repeatUntil)) return false;

    switch (schedule.recurrence) {
        case "NONE":
            return cDate.getTime() === sDate.getTime();
        case "DAILY":
            return true;
        case "WEEKLY":
            return schedule.repeatOnDays.includes(cDate.getUTCDay());
        case "MONTHLY":
            return cDate.getUTCDate() === sDate.getUTCDate();
        default:
            return false;
    }
};
