import { create } from 'zustand';

export const useUiStore = create((set) => ({
    isLoading: false,
    activeTab: 'Dashboard',

    setLoading: (isLoading) => set({ isLoading }),
    setActiveTab: (tab) => set({ activeTab: tab })
}));
