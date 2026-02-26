"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            // getMe uses api.get('/auth/me'); which sends cookies automatically
            const data = await authService.getMe();
            // Expected response: { success: true, user: {...} } or similar?
            // backend/src/controllers/auth.controller.js: getMyProfile -> res.json({ success: true, data: profile })
            // frontend/src/services/auth.service.js: getMe -> return response.data
            // So data here is { success: true, data: profile }
            if (data.success) {
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, remember) => {
        const data = await authService.login(email, password, remember);
        setUser(data.data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await authService.register({ name, email, password });
        // Depending on backend, might return user or just success message
        // If it logs in automatically:
        // setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const logoutAll = async () => {
        try {
            await authService.logoutAll();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout All failed", error);
        }
    };

    const requestOtp = async (email) => {
        // Implement OTP request logic here
        // For now, assuming authService has this method or we need to add it
        return await authService.requestOtp(email);
    };

    const verifyOtp = async (email, otp) => {
        return await authService.verifyOtp(email, otp);
    };

    // Alias register as signup to match component expectation
    const signup = register;

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, logoutAll, checkSession, requestOtp, verifyOtp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
