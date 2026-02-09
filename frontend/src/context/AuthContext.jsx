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
            const data = await authService.getMe();
            setUser(data);
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

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
