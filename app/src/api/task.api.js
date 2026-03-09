import client from './client';

export const getTasks = (params) => client.get('/task', { params });
export const createTask = (data) => client.post('/task', data);
export const updateTask = (id, d) => client.put(`/task/${id}`, d);
export const deleteTask = (id) => client.delete(`/task/${id}`);
export const completeTask = (id) => client.post(`/taskCompletion/${id}/complete`);
