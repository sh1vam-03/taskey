import api from './api';
import scheduleService from "./schedule.service";
import taskService from "./task.service";

const calendarService = {
    /**
     * Get all events (schedules and tasks due) for a given date range
     * @param {string} from - ISO Date string (YYYY-MM-DD)
     * @param {string} to - ISO Date string (YYYY-MM-DD)
     */
    async getDayCalendar(date) {
        const response = await api.get('/calendar/day', { params: { date } });
        return this.normalizeBackendResponse(response.data.data);
    },

    async getWeekCalendar(date) {
        const response = await api.get('/calendar/week', { params: { date } });
        return this.normalizeBackendResponse(response.data.data);
    },

    async getMonthCalendar(year, month) {
        const response = await api.get('/calendar/month', { params: { year, month } });
        return this.normalizeBackendResponse(response.data.data);
    },

    /**
     * Normalize Backend Response { days: { "YYYY-MM-DD": [items...] } }
     * into Flat Array [{ date: "YYYY-MM-DD", ...item }]
     */
    normalizeBackendResponse(data) {
        if (!data || !data.days) return [];

        const events = [];
        Object.entries(data.days).forEach(([dateStr, items]) => {
            items.forEach(item => {
                events.push({
                    id: `${item.id}-${dateStr}`, // Composite unique key for React
                    scheduleId: item.scheduleId, // Preserve original IDs
                    taskId: item.taskId,
                    title: item.title,
                    description: item.description || null,
                    date: dateStr,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    dueDate: item.dueDate || null,
                    recurrence: item.recurrence || null,
                    repeatOnDays: item.repeatOnDays || null,
                    scheduleDate: item.scheduleDate || null,
                    category: item.category || null,
                    type: item.type === "SCHEDULED" ? "SCHEDULE" : "TASK",
                    status: item.status,
                    color: item.type === "SCHEDULED" ? "cyan" : "red",
                    priority: item.priority
                });
            });
        });
        return events;
    }
};

export default calendarService;
