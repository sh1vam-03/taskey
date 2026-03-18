import { useState, useCallback } from 'react';
import { useTaskStore } from '../store/task.store';
import { getTasks, createTask, completeTask, deleteTask } from '../api/task.api';

export function useTasks() {
    const [loading, setLoading] = useState(false);
    const { tasks, setTasks } = useTaskStore();

    const fetchAllTasks = useCallback(async (params) => {
        setLoading(true);
        try {
            const { data } = await getTasks(params);
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    }, [setTasks]);

    return { tasks, loading, fetchAllTasks, createTask, completeTask, deleteTask };
}
