import api from "@/services/api"

export const submitContactForm = async (payload) => {
    // Currently no backend route for contact, simulating or using a generic one
    // Assuming /api/contact exists or mocking success

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Note: If backend had a contact route, we would call:
    // await api.post("/contact-us", payload)

    return { success: true, message: "Message sent! We'll get back to you soon." }
}
