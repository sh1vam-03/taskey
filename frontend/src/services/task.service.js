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
        return response.data; // Returns { tasks: [], meta: { ... } }
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

    // Complete Task
    completeTask: async (id, date) => {
        const response = await api.post(`/taskCompletion/${id}/complete`, { date });
        return response.data;
    },

    // Undo Completion
    undoCompleteTask: async (id, date) => {
        // DELETE request with body is tricky in some clients, but axios supports it via 'data' config
        // However, standard DELETE usually implies resource. RESTful design often puts params in URL.
        // Let's check backend implementation. Pass date in body if required.
        const response = await api.delete(`/taskCompletion/${id}/completed`, { data: { date } });
        return response.data;
    },

    // Bulk Complete
    completeBulk: async (taskIds, date) => {
        const response = await api.post('/taskCompletion/complete-bulk', { taskIds, date });
        return response.data;
    }
};

export default taskService;
