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

    // Auto-detect and save timezone if user doesn't have one set
    const autoSyncTimezone = async (userData) => {
        if (userData && !userData.timezone) {
            try {
                const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (detectedTz) {
                    await authService.updateProfile({ timezone: detectedTz });
                    // Sync the local state as well
                    userData.timezone = detectedTz;
                }
            } catch (e) {
                console.warn("[AuthContext] Failed to auto-sync timezone:", e.message);
            }
        }
    };

    const checkSession = async () => {
        try {
            const data = await authService.getMe();
            if (data.success) {
                setUser(data.data);
                await autoSyncTimezone(data.data);
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
        const userData = data.data.user;
        setUser(userData);
        await autoSyncTimezone(userData);
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
            if (typeof window !== 'undefined') {
                const PUBLIC_ROUTES = ['/', '/login', '/signup', '/careers', '/privacy', '/about', '/contact', '/terms', '/security'];
                if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
                    router.replace('/login');
                }
            }
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
