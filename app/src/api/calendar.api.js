import API from './client';

/**
 * Calendar API -- TASKTIME
 * Mirrors the logic used in the web version for consistent task/schedule visualization.
 */

export const getDayCalendar = (date) => {
    return API.get(`/calendar/day?date=${date}`);
};

export const getWeekCalendar = (date) => {
    return API.get(`/calendar/week?date=${date}`);
};

export const getMonthCalendar = (year, month) => {
    return API.get(`/calendar/month?year=${year}&month=${month}`);
};
