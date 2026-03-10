import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, Platform, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDayCalendar, completeSchedule } from '../../../api/schedule.api';
import ScheduleCard from '../components/ScheduleCard';
import { EmptyState } from '../../../components/common/EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { format, addDays, startOfWeek } from 'date-fns';
import CreateScheduleScreen from './CreateScheduleScreen';

const { width: W } = Dimensions.get('window');

// API returns event-count label
const getEventLabel = (count) => `${count} event${count !== 1 ? 's' : ''} scheduled`;

export default function ScheduleScreen() {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const textColor = theme.text ?? '#fff';

    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* glass tokens */
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

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

    const totalLabel = useMemo(() => {
        return getEventLabel(schedules.length);
    }, [schedules]);

    const renderHeader = () => (
        <View style={{ paddingTop: insets.top + 16 }}>
            {/* ── PAGE TITLE (Matching TasksScreen) ── */}
            <View style={styles.pageHead}>
                <View style={[styles.pageIconWrap, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)',
                    ...Platform.select({
                        ios: {
                            shadowColor: cyan, shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15, shadowRadius: 10,
                        }
                    }),
                }]}>
                    <Icon name="calendar-clock" size={18} color={cyan} />
                </View>
                <View>
                    <Text style={[styles.pageTitle, { color: textColor }]}>SCHEDULE</Text>
                    <Text style={[styles.pageSub, {
                        color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
                    }]}>
                        {refreshing ? 'Refreshing…' : totalLabel}
                    </Text>
                </View>
            </View>

            {/* ── DATE STRIP & HEADER ── */}
            <View style={styles.calendarControl}>
                <Text style={[styles.monthTitle, { color: textColor }]}>
                    {format(selectedDate, 'MMMM yyyy')}
                </Text>

                <View style={styles.weekStrip}>
                    {weekDates.map((d, i) => {
                        const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.8}
                                style={[
                                    styles.dayItem,
                                    { backgroundColor: isSelected ? cyan : glassBg },
                                    { borderColor: isSelected ? cyan : glassBord }
                                ]}
                                onPress={() => setSelectedDate(d)}
                            >
                                <Text style={[styles.dayName, { color: isSelected ? '#000000' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') }]}>
                                    {format(d, 'EEE')}
                                </Text>
                                <Text style={[styles.dayNum, { color: isSelected ? '#000000' : textColor }]}>
                                    {format(d, 'd')}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: theme.bg ?? '#0a0a0a' }]}>
            <FlatList
                data={schedules}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 150 },
                    schedules.length === 0 && { flexGrow: 1 }
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={cyan}
                        progressViewOffset={insets.top}
                    />
                }
                renderItem={({ item }) => (
                    <ScheduleCard
                        schedule={item}
                        onToggleComplete={() => handleToggleComplete(item)}
                    />
                )}
                ListEmptyComponent={
                    <View style={{ marginTop: -8 }}>
                        <EmptyState
                            title="No events today"
                            description="Stay on top of your events."
                            icon="clipboard-text-outline"
                            action={{
                                label: "Create Event",
                                onPress: () => setIsModalOpen(true)
                            }}
                        />
                    </View>
                }
            />

            {/* ── FAB (Matching TasksScreen) ── */}
            <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                activeOpacity={0.85}
                style={[
                    styles.fab,
                    {
                        backgroundColor: cyan,
                        bottom: insets.bottom + 80,
                        ...Platform.select({
                            ios: { shadowColor: cyan, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18 },
                            android: { elevation: 10 },
                        }),
                    },
                ]}
            >
                <View style={styles.fabShimmer} />
                <Icon name="plus" size={26} color="#000" />
            </TouchableOpacity>

            <CreateScheduleScreen
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => fetchSchedule(selectedDate)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    listContent: { paddingHorizontal: 20 },

    /* Page Head */
    pageHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
    },
    pageIconWrap: {
        width: 46, height: 46,
        borderRadius: 15, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    pageTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 4 },
    pageSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    /* Calendar Control */
    calendarControl: {
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.2,
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    dayItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    dayName: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dayNum: {
        fontSize: 14,
        fontWeight: '900',
    },

    /* FAB (Consistent with TasksScreen) */
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    fabShimmer: {
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '40%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.42)',
        borderRadius: 1,
    },
});
