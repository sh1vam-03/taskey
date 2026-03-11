import client from './client';

export const login = (email, password, remember) =>
    client.post('/auth/login', { email, password, remember });

export const register = (name, email, password) =>
    client.post('/auth/signup', { name, email, password });

export const verifyOtp = (email, code) =>
    client.post('/auth/verify-otp', { email, code });

export const refreshToken = (token) =>
    client.post('/auth/refresh', { refreshToken: token });

export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me');
export const forgotPassword = (email) =>
    client.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) =>
    client.post('/auth/reset-password', { token, password });

export const logoutAll = () => client.post('/auth/logout-all');
export const deleteAccount = (otp) => client.delete('/auth/me', { data: { otp } });
export const updateProfile = (data) => client.put('/auth/me', data);
export const changePassword = (oldPassword, newPassword, otp) =>
    client.post('/auth/change-password', { oldPassword, newPassword, otp });
export const requestSecurityOtp = (password = null) =>
    client.post('/auth/request-security-otp', { password });
