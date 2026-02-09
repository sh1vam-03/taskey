import api from './api';

const taskService = {
    // Create Task
    createTask: async (taskData) => {
        const response = await api.post('/task', taskData);
        return response.data;
    },

    // Get All Tasks
    getTasks: async (filters = {}) => {
        // filters can be { categoryId, priority, isArchived, etc }
        const response = await api.get('/task', { params: filters });
        return response.data;
    },

    // Get Single Task
    getTask: async (id) => {
        const response = await api.get(`/task/${id}`);
        return response.data;
    },

    // Update Task
    updateTask: async (id, updateData) => {
        const response = await api.put(`/task/${id}`, updateData);
        return response.data;
    },

    // Delete Task
    deleteTask: async (id) => {
        const response = await api.delete(`/task/${id}`);
        return response.data;
    },

    // Mark Daily Completion (if needed via specific route, though usually handled via update or specific completion route)
    // Checking backend... headers say /api/taskCompletion is separate
};

export default taskService;
