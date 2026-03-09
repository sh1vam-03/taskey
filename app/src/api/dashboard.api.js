import API from './client';

/**
 * Dashboard API -- TASKTIME
 * Handles all endpoints related to the HomeScreen dashboard.
 */

export const getOverview = (date) => {
    return API.get(`/dashboard/overview${date ? `?date=${date}` : ''}`);
};

export const getStreaks = (date) => {
    return API.get(`/dashboard/streaks${date ? `?date=${date}` : ''}`);
};

export const getStreakCalendar = (date) => {
    return API.get(`/dashboard/streak-calendar${date ? `?date=${date}` : ''}`);
};

export const getDailyPerformance = (date) => {
    return API.get(`/dashboard/performance/daily${date ? `?date=${date}` : ''}`);
};

export const getWeeklyPerformance = (date) => {
    return API.get(`/dashboard/performance/weekly${date ? `?date=${date}` : ''}`);
};

export const getMonthlyPerformance = (params) => {
    const { year, month, date } = params;
    let query = `?year=${year}&month=${month}`;
    if (date) query += `&date=${date}`;
    return API.get(`/dashboard/performance/monthly${query}`);
};
