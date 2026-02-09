import api from "./api";

const behaviorService = {
    /**
     * Upsert behavior log for the current day
     * @param {Object} data - { focusHours, tasksCompleted, mood, notes }
     */
    async upsertBehavior(data) {
        const response = await api.post("/behavior", data);
        return response.data.data;
    },

    /**
     * Get behavior log for a specific date
     * @param {string} date - YYYY-MM-DD
     */
    async getBehaviorByDate(date) {
        const response = await api.get(`/behavior/${date}`);
        return response.data.data;
    },

    /**
     * Get behavior summary for last N days
     * @param {number} days - default 7
     */
    async getSummary(days = 7) {
        const response = await api.get(`/behavior/summary?days=${days}`);
        return response.data.data;
    },

    /**
     * Get AI explanation for score on a specific date
     * @param {string} date - YYYY-MM-DD
     */
    async explainScore(date) {
        const response = await api.get(`/behavior/explain/${date}`);
        return response.data.data; // { explanation: "..." }
    }
};

export default behaviorService;
