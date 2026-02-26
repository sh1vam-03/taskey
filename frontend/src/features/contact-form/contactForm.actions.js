import publicService from "@/services/public.service"

export const submitContactForm = async (payload) => {
    try {
        const response = await publicService.submitContactForm(payload);
        return { success: true, message: response.message || "Message sent successfully!" };
    } catch (error) {
        throw error;
    }
}
