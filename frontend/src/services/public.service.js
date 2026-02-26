import api from "./api";

const publicService = {
    /**
     * Submit contact form
     * @param {Object} data - { name, email, subject, message }
     */
    async submitContactForm(data) {
        // Note: Public routes might not need auth token, but 'api' instance usually attaches it if present.
        // If backend requires NO auth, we might need a separate axios instance or just let it slide 
        // (backend usually ignores header if route is public).
        const response = await api.post("/publicPages/contact", data);
        return response.data;
    }
};

export default publicService;
