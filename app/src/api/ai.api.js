import client from './client';

export const getConversations = () => client.get('/ai/conversations');
export const createConversation = (type) =>
    client.post('/ai/conversations', { type });
export const getMessages = (id) =>
    client.get(`/ai/conversations/${id}/messages`);
export const getSettings = () => client.get('/ai/settings');
export const updateSettings = (data) => client.patch('/ai/settings', data);
export const updateConversation = (id, data) => client.put(`/ai/conversations/${id}`, data);
export const deleteConversation = (id) => client.delete(`/ai/conversations/${id}`);

export const sendVoiceMessage = (conversationId, formData) =>
    client.post(`/ai/conversations/${conversationId}/voice`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const transcribeAudio = (formData) =>
    client.post("/ai/voice/transcribe", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const synthesizeSpeech = (data) =>
    client.post("/ai/voice/tts", data);

// Streaming handled separately in useStream.js hook
