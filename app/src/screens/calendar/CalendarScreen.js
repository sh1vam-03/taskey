import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/colors';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, subDays, subMonths, addMonths } from 'date-fns';
import { getDayCalendar, getWeekCalendar, getMonthCalendar, completeSchedule, undoCompleteSchedule } from '../../api/schedule.api';
import { completeTask, undoCompleteTask } from '../../api/task.api';
import TaskCard from '../tasks/components/TaskCard';
import ScheduleCard from '../schedule/components/ScheduleCard';

export default function CalendarScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const [view, setView] = useState('day'); // 'day', 'week', 'month'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedDate, view]);

    const normalizeData = (data) => {
        if (!data || !data.days) return [];
        const flattened = [];
        Object.entries(data.days).forEach(([dateStr, items]) => {
            items.forEach(item => {
                flattened.push({
                    ...item,
                    id: item.id || item._id,
                    date: dateStr,
                    type: item.type === "SCHEDULED" ? "SCHEDULE" : "TASK",
                });
            });
        });
        return flattened;
    };

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            let res;
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            if (view === 'day') {
                res = await getDayCalendar(dateStr);
            } else if (view === 'week') {
                res = await getWeekCalendar(dateStr);
            } else {
                res = await getMonthCalendar(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
            }

            const raw = res.data?.data || res.data || {};
            setEvents(normalizeData(raw));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(true);
    }, [selectedDate, view]);

    const handleToggleCompletion = async (item) => {
        try {
            const isCompleted = item.status === 'COMPLETED';
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            if (item.type === 'SCHEDULE') {
                isCompleted ? await undoCompleteSchedule(item.id, dateStr) : await completeSchedule(item.id, dateStr);
            } else {
                isCompleted ? await undoCompleteTask(item.id, dateStr) : await completeTask(item.id, dateStr);
            }
            fetchData(true);
        } catch (err) {
            console.error(err);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icon name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {view === 'month' ? format(selectedDate, 'MMMM yyyy') : format(selectedDate, 'MMMM do')}
                </Text>
            </View>

            <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayBtn}>
                    <Text style={{ color: cyan, fontSize: 10, fontWeight: '900' }}>TODAY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <View style={[styles.tabsPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)' }]}>
                {['day', 'week', 'month'].map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.tab, view === t && { backgroundColor: cyan }]}
                        onPress={() => setView(t)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, { color: view === t ? '#000' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)') }]}>
                            {t.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={() => {
                    if (view === 'day') setSelectedDate(subDays(selectedDate, 1));
                    else if (view === 'week') setSelectedDate(subDays(selectedDate, 7));
                    else setSelectedDate(subMonths(selectedDate, 1));
                }} style={styles.controlBtn}>
                    <Icon name="chevron-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (view === 'day') setSelectedDate(addDays(selectedDate, 1));
                    else if (view === 'week') setSelectedDate(addDays(selectedDate, 7));
                    else setSelectedDate(addMonths(selectedDate, 1));
                }} style={styles.controlBtn}>
                    <Icon name="chevron-right" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDayView = () => (
        <ScrollView
            contentContainerStyle={styles.viewContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cyan} />}
        >
            {events.length > 0 ? (
                events.map((item, idx) => (
                    item.type === 'SCHEDULE' ? (
                        <ScheduleCard
                            key={item.id || idx}
                            schedule={item}
                            onToggleComplete={() => handleToggleCompletion(item)}
                            isToday={isSameDay(new Date(item.date), new Date())}
                        />
                    ) : (
                        <TaskCard
                            key={item.id || idx}
                            item={item}
                            onPress={() => navigation.navigate('TaskDetail', { task: item })}
                        />
                    )
                ))
            ) : (
                <View style={styles.empty}>
                    <View style={[styles.emptyIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                        <Icon name="calendar-blank" size={42} color={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No events scheduled</Text>
                    <Text style={[styles.emptyText, { color: theme.textDim }]}>Your schedule is clear for this day.</Text>
                </View>
            )}
        </ScrollView>
    );

    const renderWeekView = () => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        return (
            <ScrollView
                contentContainerStyle={styles.viewContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={cyan} />}
            >
                {days.map((day, idx) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayEvents = events.filter(e => e.date === dayStr);
                    const isTodayLocal = isSameDay(day, new Date());

                    return (
                        <View key={idx} style={[styles.weekDayRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                            <TouchableOpacity
                                onPress={() => { setSelectedDate(day); setView('day'); }}
                                style={[styles.weekDayLabel, isTodayLocal && { backgroundColor: cyan + '22', borderRadius: 12, paddingVertical: 8 }]}
                            >
                                <Text style={[styles.weekDayName, { color: isTodayLocal ? cyan : theme.textDim }]}>{format(day, 'EEE').toUpperCase()}</Text>
                                <Text style={[styles.weekDayNum, { color: isTodayLocal ? cyan : theme.text }]}>{format(day, 'd')}</Text>
                            </TouchableOpacity>

                            <View style={styles.weekDayEvents}>
                                {dayEvents.length > 0 ? (
                                    dayEvents.slice(0, 3).map((event, eIdx) => (
                                        <View
                                            key={eIdx}
                                            style={[
                                                styles.weekEventPill,
                                                { backgroundColor: event.type === 'SCHEDULE' ? cyan + '15' : '#ff444415' }
                                            ]}
                                        >
                                            <View style={[styles.weekEventDot, { backgroundColor: event.type === 'SCHEDULE' ? cyan : '#ff4444' }]} />
                                            <Text style={[styles.weekEventText, { color: theme.text }]} numberOfLines={1}>
                                                {event.title}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={[styles.emptyTextSmall, { color: theme.textDim }]}>No events</Text>
                                )}
                                {dayEvents.length > 3 && (
                                    <Text style={[styles.moreText, { color: cyan }]}>+{dayEvents.length - 3} MORE</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    const renderMonthView = () => {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const days = eachDayOfInterval({ start, end });
        const firstDayIdx = start.getDay();
        const leading = Array(firstDayIdx === 0 ? 6 : firstDayIdx - 1).fill(null);

        return (
            <View style={styles.viewContent}>
                <View style={styles.monthHeader}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <Text key={i} style={[styles.monthDayHeader, { color: theme.textDim }]}>{d}</Text>
                    ))}
                </View>
                <View style={styles.monthGrid}>
                    {[...leading, ...days].map((day, idx) => {
                        const dayStr = day ? format(day, 'yyyy-MM-dd') : null;
                        const dayEvents = day ? events.filter(e => e.date === dayStr) : [];
                        const isTodayLocal = day && isSameDay(day, new Date());
                        const isSelected = day && isSameDay(day, selectedDate);

                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.monthDayCell,
                                    isSelected && { backgroundColor: cyan + '15', borderRadius: 12 }
                                ]}
                                disabled={!day}
                                onPress={() => { setSelectedDate(day); setView('day'); }}
                            >
                                {day && (
                                    <>
                                        <Text style={[
                                            styles.monthDayText,
                                            { color: theme.text },
                                            isTodayLocal && { color: cyan, fontWeight: '900' },
                                            isSelected && { color: cyan }
                                        ]}>
                                            {format(day, 'd')}
                                        </Text>
                                        <View style={styles.monthEventDots}>
                                            {dayEvents.slice(0, 3).map((e, ei) => (
                                                <View
                                                    key={ei}
                                                    style={[
                                                        styles.dot,
                                                        { backgroundColor: e.type === 'SCHEDULE' ? cyan : '#ff4444' }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? (theme.bg ?? '#000') : (theme.surface ?? '#f8fafc') }]}>
            {renderHeader()}
            {renderTabs()}

            <View style={{ flex: 1 }}>
                {view === 'day' && renderDayView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    /* Header */
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    todayBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.1)' },

    /* Tabs */
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    tabsPill: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 16,
        padding: 5,
        borderWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    controls: { flexDirection: 'row', gap: 6 },
    controlBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

    /* Day View */
    viewContent: { paddingHorizontal: 20, paddingBottom: 100 },

    /* Empty State */
    empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
    emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20, opacity: 0.7 },

    /* Week View */
    weekDayRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1 },
    weekDayLabel: { width: 60, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    weekDayName: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
    weekDayNum: { fontSize: 22, fontWeight: '900' },
    weekDayEvents: { flex: 1, gap: 6, justifyContent: 'center' },
    weekEventPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: 'rgba(255,255,255,0.1)' },
    weekEventDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    weekEventText: { fontSize: 12, fontWeight: '700' },
    emptyTextSmall: { fontSize: 12, opacity: 0.5, fontWeight: '600' },
    moreText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },

    /* Month View */
    monthHeader: { flexDirection: 'row', marginBottom: 16 },
    monthDayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '900', opacity: 0.4 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    monthDayCell: { width: '14.28%', height: 75, alignItems: 'center', paddingTop: 10 },
    monthDayText: { fontSize: 15, fontWeight: '700' },
    monthEventDots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2, marginTop: 6, paddingHorizontal: 4 },
    dot: { width: 5, height: 5, borderRadius: 2.5 },
});
