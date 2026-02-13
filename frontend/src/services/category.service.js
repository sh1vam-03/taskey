import api from './api';

const categoryService = {
    // Get all categories
    getCategories: async () => {
        const response = await api.get('/category');
        return response.data.data; // backend returns { success: true, data: [...] }
    },

    // Create a new category
    createCategory: async (data) => {
        const response = await api.post('/category', data);
        return response.data.data;
    },

    // Update a category
    updateCategory: async (id, data) => {
        const response = await api.put(`/category/${id}`, data);
        return response.data.data;
    },

    // Delete a category
    deleteCategory: async (id) => {
        const response = await api.delete(`/category/${id}`);
        return response.data;
    }
};

export default categoryService;
