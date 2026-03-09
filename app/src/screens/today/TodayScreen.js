import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleCard from '../schedule/components/ScheduleCard';
import { getDayCalendar } from '../../api/schedule.api';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';

export default function TodayScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const { theme } = useTheme();
    const today = format(new Date(), 'yyyy-MM-dd');

    const fetchToday = async () => {
        try {
            const { data } = await getDayCalendar(today);
            const calendarData = data?.data || data;
            setSchedules(calendarData?.days?.[today] || []);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchToday();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchToday();
    }, []);

    const now = new Date().getHours() * 100 + new Date().getMinutes();
    const currentTask = schedules.find(s => {
        const [h, m] = s.time.split(':').map(Number);
        const startTime = h * 100 + m;
        // Simple logic: within 1 hour or the current hour
        return startTime <= now && startTime + 100 > now;
    });

    const upcomingTasks = schedules.filter(s => {
        const [h, m] = s.time.split(':').map(Number);
        const startTime = h * 100 + m;
        return startTime > now;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.localHeader}>
                <Text style={[styles.localHeaderTitle, { color: theme.text }]}>TODAY</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.cyan} />}
            >
                {currentTask && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.cyan }]}>NOW</Text>
                        <ScheduleCard schedule={currentTask} isToday={true} />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.cyan }]}>UPCOMING</Text>
                    {upcomingTasks.length > 0 ? (
                        upcomingTasks.map(task => (
                            <ScheduleCard key={task._id} schedule={task} />
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.textDim }]}>No upcoming tasks for today.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    localHeader: {
        paddingHorizontal: 20,
        height: 70,
        justifyContent: 'center',
    },
    localHeaderTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    scroll: { padding: 20, paddingBottom: 100 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16 },
    emptyText: { textAlign: 'center', marginTop: 20 },
});
