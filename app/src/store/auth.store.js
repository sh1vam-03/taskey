import { create } from 'zustand';
import { Storage } from '../utils/storage';

console.log('### LOADING: auth.store.js');
export const useAuthStore = create((set) => ({
    user: Storage.getUser(),
    accessToken: Storage.getAccessToken(),
    isLoggedIn: !!Storage.getAccessToken(),

    setAuth: (user, accessToken, refreshToken) => {
        Storage.setUser(user);
        Storage.setAccessToken(accessToken);
        if (refreshToken) Storage.setRefreshToken(refreshToken);
        set({ user, accessToken, isLoggedIn: true });
    },

    logout: () => {
        Storage.clear();
        set({ user: null, accessToken: null, isLoggedIn: false });
    },

    updateUser: (updates) => set((s) => {
        const updated = { ...s.user, ...updates };
        Storage.setUser(updated);
        return { user: updated };
    }),
}));
