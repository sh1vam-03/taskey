import api from './api';

const tasksService = {
    getAll: async () => {
        const response = await api.get('/task');
        return response.data;
    },

    create: async (payload) => {
        const response = await api.post('/task', payload);
        return response.data;
    },

    update: async (id, payload) => {
        const response = await api.put(`/task/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/task/${id}`);
        return response.data;
    }
};

export default tasksService;
