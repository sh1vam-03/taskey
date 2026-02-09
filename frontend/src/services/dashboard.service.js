import api from './api';

const dashboardService = {
    // Overview
    getOverview: async () => {
        const response = await api.get('/dashboard/overview');
        return response.data;
    },

    // Today
    getToday: async () => {
        const response = await api.get('/dashboard/today');
        return response.data;
    },

    // Weekly
    getWeekly: async () => {
        const response = await api.get('/dashboard/weekly');
        return response.data;
    },

    // Monthly
    getMonthly: async () => {
        const response = await api.get('/dashboard/monthly');
        return response.data;
    },

    // Streaks
    getStreaks: async () => {
        const response = await api.get('/dashboard/streaks');
        return response.data;
    },

    getStreakCalendar: async () => {
        const response = await api.get('/dashboard/streak-calendar');
        return response.data;
    },

    // Performance
    getDailyPerformance: async () => {
        const response = await api.get('/dashboard/performance/daily');
        return response.data;
    },

    getWeeklyPerformance: async () => {
        const response = await api.get('/dashboard/performance/weekly');
        return response.data;
    },

    getMonthlyPerformance: async () => {
        const response = await api.get('/dashboard/performance/monthly');
        return response.data;
    }
};

export default dashboardService;
