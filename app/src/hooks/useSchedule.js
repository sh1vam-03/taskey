import { useState, useCallback } from 'react';
import { getCalendar, createSchedule, deleteSchedule, completeSchedule } from '../api/schedule.api';

export function useSchedule() {
    const [loading, setLoading] = useState(false);

    const fetchSchedule = useCallback(async (from, to) => {
        setLoading(true);
        try {
            const { data } = await getCalendar(from, to);
            return data;
        } catch (err) {
            console.error('Failed to fetch schedule', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, fetchSchedule, createSchedule, deleteSchedule, completeSchedule };
}
