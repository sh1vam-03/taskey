import scheduleService from "./schedule.service";
import taskService from "./task.service";

const calendarService = {
    /**
     * Get all events (schedules and tasks due) for a given date range
     * @param {string} from - ISO Date string (YYYY-MM-DD)
     * @param {string} to - ISO Date string (YYYY-MM-DD)
     */
    async getEvents(from, to) {
        try {
            // Parallel fetch
            const [schedules, tasks] = await Promise.all([
                scheduleService.getSchedules({ from, to }),
                taskService.getTasks() // Task service might not support date range filtering yet, filtering client side
            ]);

            // Transform Schedules to Events
            const scheduleEvents = schedules.map(s => ({
                id: s.id,
                title: s.task?.title || "Busy",
                date: s.scheduleDate.split('T')[0],
                startTime: s.startTime,
                endTime: s.endTime,
                type: 'SCHEDULE',
                color: 'cyan', // Visual cue
                original: s
            }));

            // Transform Tasks with Due Dates to Events
            // Filter tasks that fall within range matching 'from' and 'to'
            // Simple string comparison works for ISO dates yyyy-mm-dd
            const taskEvents = tasks
                .filter(t => t.dueDate && t.dueDate.split('T')[0] >= from && t.dueDate.split('T')[0] <= to && !t.isArchived)
                .map(t => ({
                    id: t.id,
                    title: `Due: ${t.title}`,
                    date: t.dueDate.split('T')[0],
                    type: 'TASK',
                    color: 'red', // Visual cue for deadlines
                    priority: t.priority,
                    original: t
                }));

            return [...scheduleEvents, ...taskEvents];
        } catch (error) {
            console.error("Calendar fetch error:", error);
            throw error;
        }
    }
};

export default calendarService;
