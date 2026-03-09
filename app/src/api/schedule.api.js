import client from './client';

export const getDayCalendar = (date) =>
    client.get('/calendar/day', { params: { date } });
export const getWeekCalendar = (date) =>
    client.get('/calendar/week', { params: { date } });
export const createSchedule = (data) => client.post('/schedule', data);
export const deleteSchedule = (id) => client.delete(`/schedule/${id}`);
export const completeSchedule = (id) =>
    client.post(`/scheduleCompletion/${id}/complete`);
