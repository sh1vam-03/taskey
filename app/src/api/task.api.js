import client from './client';

export const getTasks = (params) => client.get('/task', { params });
export const createTask = (data) => client.post('/task', data);
export const updateTask = (id, d) => client.put(`/task/${id}`, d);
export const deleteTask = (id) => client.delete(`/task/${id}`);
export const getTask = (id) => client.get(`/task/${id}`);
export const completeTask = (id, date) => client.post(`/taskCompletion/${id}/complete`, { date });
export const undoCompleteTask = (id, date) => client.delete(`/taskCompletion/${id}/completed`, { data: { date } });
export const completeBulk = (taskIds, date) => client.post('/taskCompletion/complete-bulk', { taskIds, date });
