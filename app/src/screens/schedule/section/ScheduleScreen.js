import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getDayCalendar, completeSchedule } from '../../../api/schedule.api';
import ScheduleCard from '../components/ScheduleCard';
import EmptyState from '../../../components/common/EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { format, addDays, startOfWeek } from 'date-fns';
import CreateScheduleScreen from './CreateScheduleScreen';

export default function ScheduleScreen() {
    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        // Generate week strip
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
        const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
        setWeekDates(dates);
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    const fetchSchedule = async (date) => {
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const { data } = await getDayCalendar(formattedDate);
            // Backend returns { success, message, data: { days: { "YYYY-MM-DD": [...] } } }
            const calendarData = data?.data || data;
            setSchedules(calendarData?.days?.[formattedDate] || []);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    const handleToggleComplete = async (schedule) => {
        try {
            await completeSchedule(schedule._id);
            fetchSchedule(selectedDate);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <View style={styles.localHeader}>
                <Text style={[styles.localHeaderTitle, { color: theme.text }]}>SCHEDULE</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.cyan }]}
                    onPress={() => setIsModalOpen(true)}
                >
                    <Icon name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{format(selectedDate, 'MMM yyyy')}</Text>
                <View style={styles.weekStrip}>
                    {weekDates.map((d, i) => {
                        const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <TouchableOpacity
                                key={i}
                                style={[styles.dayItem, isSelected && { backgroundColor: theme.cyan }]}
                                onPress={() => setSelectedDate(d)}
                            >
                                <Text style={[styles.dayName, { color: isSelected ? '#000000' : theme.textMuted }]}>
                                    {format(d, 'EEE')}
                                </Text>
                                <Text style={[styles.dayNum, { color: isSelected ? '#000000' : theme.text }]}>
                                    {format(d, 'd')}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>

            <FlatList
                data={schedules}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.cyan} />}
                renderItem={({ item }) => (
                    <ScheduleCard
                        schedule={item}
                        onToggleComplete={() => handleToggleComplete(item)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        title="No scheduled blocks"
                        description="Tap + to schedule a task to your calendar."
                        icon={<Icon name="calendar" size={48} color={theme.textDim} />}
                    />
                }
            />

            <CreateScheduleScreen
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => fetchSchedule(selectedDate)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    localHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 70,
    },
    localHeaderTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: { padding: 16, borderBottomWidth: 1 },
    headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: 'bold', marginBottom: 12 },
    weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
    dayItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
    dayName: { fontSize: typography.fontSizes.xs, marginBottom: 4 },
    dayNum: { fontSize: typography.fontSizes.md, fontWeight: 'bold' },
    listContent: { padding: 16, paddingBottom: 100 },
});
