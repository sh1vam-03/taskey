import api from './api';

const dashboardService = {
    // Overview
    getOverview: async (date) => {
        const response = await api.get('/dashboard/overview', { params: { date } });
        return response.data.data;
    },

    // Today
    getToday: async (date) => {
        const response = await api.get('/dashboard/today', { params: { date } });
        return response.data.data;
    },

    // Weekly
    getWeekly: async () => {
        const response = await api.get('/dashboard/weekly');
        return response.data.data;
    },

    // Monthly
    getMonthly: async () => {
        const response = await api.get('/dashboard/monthly');
        return response.data.data;
    },

    // Streaks
    getStreaks: async (date) => {
        const params = date ? { date } : {};
        const response = await api.get('/dashboard/streaks', { params });
        return response.data.data;
    },

    getStreakCalendar: async (date) => {
        const params = date ? { date } : {};
        const response = await api.get('/dashboard/streak-calendar', { params });
        return response.data.data;
    },

    // Performance
    getDailyPerformance: async (date) => {
        const params = date ? { date } : {};
        const response = await api.get('/dashboard/performance/daily', { params });
        return response.data.data;
    },

    getWeeklyPerformance: async (date) => {
        const params = date ? { date } : {};
        const response = await api.get('/dashboard/performance/weekly', { params });
        return response.data.data;
    },

    getMonthlyPerformance: async (year, month, date) => {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        if (date) params.date = date;
        const response = await api.get('/dashboard/performance/monthly', { params });
        return response.data.data;
    }
};

export default dashboardService;
