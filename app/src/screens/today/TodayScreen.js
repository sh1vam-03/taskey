import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    RefreshControl, Platform, Dimensions, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScheduleCard from '../schedule/components/ScheduleCard';
import { getDayCalendar } from '../../api/schedule.api';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import { EmptyState } from '../../components/common/EmptyState';
import CreateScheduleScreen from '../schedule/section/CreateScheduleScreen';
import CreateTaskScreen from '../tasks/sections/CreateTaskScreen';

const { width: W } = Dimensions.get('window');

/* ── Section header (Matching TasksScreen) ────────────────────────────────── */
function SectionLabel({ icon, iconColor, label, count, isDark }) {
    return (
        <View style={[styles.sectionLabel, {
            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={icon} size={11} color={iconColor} style={{ marginRight: 7 }} />
                <Text style={[styles.sectionTxt, {
                    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                }]}>
                    {label}
                </Text>
            </View>
            <View style={[styles.sectionBadge, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
            }]}>
                <Text style={[styles.sectionBadgeTxt, {
                    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                }]}>
                    {count}
                </Text>
            </View>
        </View>
    );
}

export default function TodayScreen() {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const textColor = theme.text ?? '#fff';

    const [refreshing, setRefreshing] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [preselectedTask, setPreselectedTask] = useState(null);

    const today = format(new Date(), 'yyyy-MM-dd');

    /* glass tokens */
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

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
    const currentTask = useMemo(() => schedules.find(s => {
        const [h, m] = s.time.split(':').map(Number);
        const startTime = h * 100 + m;
        // Simple logic: within 1 hour or the current hour
        return startTime <= now && startTime + 100 > now;
    }), [schedules, now]);

    const upcomingTasks = useMemo(() => schedules.filter(s => {
        const [h, m] = s.time.split(':').map(Number);
        const startTime = h * 100 + m;
        return startTime > now;
    }), [schedules, now]);

    return (
        <View style={[styles.root, { backgroundColor: theme.bg ?? '#0a0a0a' }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scroll,
                    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 150 },
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
            >
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
                        <Icon name="clock-outline" size={18} color={cyan} />
                    </View>
                    <View>
                        <Text style={[styles.pageTitle, { color: textColor }]}>TODAY</Text>
                        <Text style={[styles.pageSub, {
                            color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
                        }]}>
                            {refreshing ? 'Refreshing…' : `${schedules.length} event${schedules.length !== 1 ? 's' : ''} active`}
                        </Text>
                    </View>
                </View>

                {/* ── SECTIONS ── */}
                {schedules.length === 0 && !refreshing ? (
                    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
                        <EmptyState
                            title="No events today"
                            description="Your events are clear for today."
                            icon="calendar-check"
                            action={{
                                label: "Add Task",
                                onPress: () => setIsCreateModalOpen(true)
                            }}
                        />
                    </View>
                ) : (
                    <View>
                        {currentTask && (
                            <View style={styles.group}>
                                <SectionLabel
                                    icon="play-circle-outline"
                                    iconColor={cyan}
                                    label="CURRENT EVENT"
                                    count={1}
                                    isDark={isDark}
                                />
                                <ScheduleCard schedule={currentTask} isToday={true} />
                            </View>
                        )}

                        {upcomingTasks.length > 0 && (
                            <View style={styles.group}>
                                <SectionLabel
                                    icon="chevron-double-right"
                                    iconColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
                                    label="UPCOMING EVENTS"
                                    count={upcomingTasks.length}
                                    isDark={isDark}
                                />
                                {upcomingTasks.map(task => (
                                    <ScheduleCard key={task._id} schedule={task} />
                                ))}
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* ── FAB ── */}
            <TouchableOpacity
                onPress={() => setIsCreateModalOpen(true)}
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

            <CreateTaskScreen
                visible={isCreateModalOpen}
                hideDueDate={true}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => fetchToday()}
                onScheduleRequested={(task) => {
                    setPreselectedTask(task);
                    setIsScheduleModalOpen(true);
                }}
            />

            <CreateScheduleScreen
                visible={isScheduleModalOpen}
                preselectedTaskId={preselectedTask?.id || preselectedTask?._id}
                onClose={() => {
                    setIsScheduleModalOpen(false);
                    setPreselectedTask(null);
                }}
                onCreated={() => {
                    fetchToday();
                    setPreselectedTask(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 20 },

    /* Header */
    pageHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    pageIconWrap: {
        width: 46, height: 46,
        borderRadius: 15, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    pageTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 4 },
    pageSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    /* Groups */
    group: { marginBottom: 26 },
    sectionLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
    },
    sectionTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
    sectionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    sectionBadgeTxt: { fontSize: 10, fontWeight: '700' },

    /* FAB */
    fab: {
        position: 'absolute', right: 20,
        width: 56, height: 56,
        borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    fabShimmer: {
        position: 'absolute', top: 0, left: '10%',
        width: '40%', height: 1,
        backgroundColor: 'rgba(255,255,255,0.42)', borderRadius: 1,
    },
});
