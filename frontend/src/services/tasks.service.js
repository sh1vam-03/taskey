import api from './api';

const tasksService = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    create: async (payload) => {
        const response = await api.post('/tasks', payload);
        return response.data;
    },

    update: async (id, payload) => {
        const response = await api.put(`/tasks/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    }
};

export default tasksService;
