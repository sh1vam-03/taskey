import api from '@/services/api';

export const dashboardApi = {
    fetchOverview: async () => {
        const response = await api.get('/dashboard/overview');
        return response.data.data;
    },
    fetchToday: async () => {
        const response = await api.get('/dashboard/today');
        return response.data.data;
    },
    fetchUsage: async () => {
        const response = await api.get('/usage/me');
        return response.data.data;
    },
    fetchBilling: async () => {
        const response = await api.get('/billing/current');
        return response.data.data;
    },
    updateBehavior: async () => {
        try {
            await api.post('/behavior');
        } catch (error) {
            console.error("Background behavior update failed:", error);
        }
    },
    completeSchedule: async (id) => {
        const response = await api.post(`/scheduleCompletion/${id}/complete`);
        return response.data;
    }
};
