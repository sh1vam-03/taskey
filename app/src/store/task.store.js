import { create } from 'zustand';

export const useTaskStore = create((set) => ({
    tasks: [],
    filterPriority: 'ALL', // ALL | HIGH | MEDIUM | LOW

    setTasks: (tasks) => set({ tasks }),
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t._id === id ? { ...t, ...updates } : t)
    })),
    deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t._id !== id)
    })),
    setFilterPriority: (priority) => set({ filterPriority: priority })
}));
