export const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getUTCMonth() + 1, // 1–12 (UTC)
        year: now.getUTCFullYear(),
    };
};

export const startOfUTCDate = (d = new Date()) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export const dayKey = (d) => d.toISOString().slice(0, 10);

export const getWeekRange = (date) => {
    const d = startOfUTCDate(date);
    const day = d.getUTCDay(); // 0=Sun
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);

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
            return sDate.getTime() === cDate.getTime();
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
