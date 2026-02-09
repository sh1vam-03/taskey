import api from './api';

const scheduleService = {
    // Create Schedule
    createSchedule: async (scheduleData) => {
        const response = await api.post('/schedule', scheduleData);
        return response.data;
    },

    // Get Schedules
    getSchedules: async (filters = {}) => {
        // filters: { date, from, to }
        const response = await api.get('/schedule', { params: filters });
        return response.data;
    },

    // Update Schedule
    updateSchedule: async (id, updateData) => {
        const response = await api.put(`/schedule/${id}`, updateData);
        return response.data;
    },

    // Delete Schedule
    deleteSchedule: async (id) => {
        const response = await api.delete(`/schedule/${id}`);
        return response.data;
    },
};

export default scheduleService;
