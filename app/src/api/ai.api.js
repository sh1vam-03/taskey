import client from './client';

export const getConversations = () => client.get('/ai/conversations');
export const createConversation = (type) =>
    client.post('/ai/conversations', { type });
export const getMessages = (id) =>
    client.get(`/ai/conversations/${id}/messages`);
export const getSettings = () => client.get('/ai/settings');
export const updateSettings = (data) => client.put('/ai/settings', data);
export const updateConversation = (id, data) => client.put(`/ai/conversations/${id}`, data);
export const deleteConversation = (id) => client.delete(`/ai/conversations/${id}`);
// Streaming handled separately in useStream.js hook
