import client from './client';

export const getCategories = () => client.get('/category');
export const createCategory = (data) => client.post('/category', data);
export const updateCategory = (id, data) => client.put(`/category/${id}`, data);
export const deleteCategory = (id) => client.delete(`/category/${id}`);
