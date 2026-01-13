export const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getMonth() + 1, // 1–12
        year: now.getFullYear(),
    };
};
