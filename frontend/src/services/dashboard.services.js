import api from './api';

const dashboardService = {
    getOverview: async () => {
        const response = await api.get('/dashboard/overview');
        return response.data;
    },

    getTodayDashboard: async () => {
        const response = await api.get('/dashboard/today');
        return response.data;
    },

    getWeeklyDashboard: async () => {
        const response = await api.get('/dashboard/weekly');
        return response.data;
    },

    getMonthlyDashboard: async () => {
        const response = await api.get('/dashboard/monthly');
        return response.data;
    },

    getStreaks: async () => {
        const response = await api.get('/dashboard/streaks');
        return response.data;
    },

    getStreakCalendar: async () => {
        const response = await api.get('/dashboard/streak-calendar');
        return response.data;
    }
};

export default dashboardService;
