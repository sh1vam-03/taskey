import api from './api';

const authService = {
    // Register
    register: async (data) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },

    // Login
    login: async (email, password, remember = false) => {
        const response = await api.post('/auth/login', { email, password, remember });
        return response.data;
    },

    // Logout
    logout: async () => {
        await api.post('/auth/logout');
    },

    // Logout All Devices
    logoutAll: async () => {
        await api.post('/auth/logout-all');
    },

    // Get Current User (Session Check)
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Forgot Password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset Password
    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    // Request OTP
    requestOtp: async (email) => {
        const response = await api.post('/auth/otp-request', { email });
        return response.data;
    },

    // Verify OTP
    verifyOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    // Delete Account
    deleteAccount: async (otp) => {
        const response = await api.delete('/auth/me', { data: { otp } });
        return response.data;
    },

    // Update Profile
    updateProfile: async (data) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },

    // Change Password
    changePassword: async (oldPassword, newPassword, otp) => {
        const response = await api.post('/auth/change-password', { oldPassword, newPassword, otp });
        return response.data;
    },

    // Request Security OTP
    requestSecurityOtp: async (password = null) => {
        const response = await api.post('/auth/request-security-otp', { password });
        return response.data;
    },
};

export default authService;
