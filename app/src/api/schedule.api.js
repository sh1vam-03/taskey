import client from './client';

export const getDayCalendar = (date) =>
    client.get('/calendar/day', { params: { date } });
export const getWeekCalendar = (date) =>
    client.get('/calendar/week', { params: { date } });
export const getMonthCalendar = (year, month) =>
    client.get('/calendar/month', { params: { year, month } });
export const getSchedules = (params) => client.get('/schedule', { params });
export const createSchedule = (data) => client.post('/schedule', data);
export const updateSchedule = (id, data) => client.put(`/schedule/${id}`, data);
export const deleteSchedule = (id) => client.delete(`/schedule/${id}`);
export const completeSchedule = (id, date) =>
    client.post(`/scheduleCompletion/${id}/complete`, { date });
export const undoCompleteSchedule = (id, date) =>
    client.delete(`/scheduleCompletion/${id}/complete`, { data: { date } });
