import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { login, register, verifyOtp, logout } from '../api/auth.api';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const setAuth = useAuthStore(state => state.setAuth);
    const performLogout = useAuthStore(state => state.logout);

    const handleLogin = async (email, password, remember) => {
        try {
            setLoading(true); setError(null);
            const { data } = await login(email, password, remember);
            setAuth(data.user, data.accessToken, data.refreshToken);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error(err);
        } finally {
            performLogout();
        }
    };

    return { loading, error, handleLogin, handleLogout };
}
