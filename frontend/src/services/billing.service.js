import api from "./api";

const billingService = {
    /**
     * Get current subscription details
     */
    async getCurrentSubscription() {
        const response = await api.get("/billing/current");
        return response.data.data;
    },

    /**
     * Subscribe to a plan
     * @param {string} plan - PRO, PRO_PLUS
     * @param {string} billingCycle - MONTHLY, YEARLY
     */
    async subscribe(plan, billingCycle) {
        const response = await api.post("/billing/subscribe", { plan, billingCycle });
        return response.data;
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription() {
        const response = await api.post("/billing/cancel");
        return response.data;
    },

    /**
     * Downgrade plan
     * @param {string} newPlan 
     */
    async downgradePlan(newPlan) {
        const response = await api.post("/billing/downgrade", { newPlan });
        return response.data;
    },

    /**
     * Create Top-Up Order
     * @param {string} topUpId 
     */
    async createTopUp(topUpId) {
        const response = await api.post("/billing/top-up", { topUpId });
        return response.data;
    },

    /**
     * Verify Top-Up Payment
     */
    async verifyTopUp(paymentData) {
        const response = await api.post("/billing/top-up/verify", paymentData);
        return response.data;
    },

    /**
     * Get payment history
     */
    async getHistory() {
        const response = await api.get("/billing/history");
        return response.data.data;
    }
};

export default billingService;
