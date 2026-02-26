import api from "@/services/api"

export const loginUser = async (email, password, remember) => {
    const { data } = await api.post("/auth/login", { email, password, remember })
    return data
}

export const signupUser = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password })
    return data
}

export const logoutUser = async () => {
    const { data } = await api.post("/auth/logout")
    return data
}

export const fetchCurrentUser = async () => {
    const { data } = await api.get("/auth/me")
    return data
}

export const requestOtp = async (email) => {
    const { data } = await api.post("/auth/otp-request", { email })
    return data
}

export const verifyOtp = async (payload) => {
    const { data } = await api.post("/auth/verify-otp", payload)
    return data
}

export const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email })
    return data
}

export const resetPassword = async (token, password) => {
    const { data } = await api.post("/auth/reset-password", { token, password })
    return data
}
