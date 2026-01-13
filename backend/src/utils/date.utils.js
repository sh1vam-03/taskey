export const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getUTCMonth() + 1, // 1–12 (UTC)
        year: now.getUTCFullYear(),
    };
};
