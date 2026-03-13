/**
 * TasksScreen -- TASKTIME
 * Main task list. Navigates to CreateTaskScreen and TaskDetailScreen.
 *
 * Stack navigation expected:
 *   navigation.navigate('CreateTask')               → create mode
 *   navigation.navigate('CreateTask', { task })     → edit mode
 *   navigation.navigate('TaskDetail', { task })     → detail view
 *
 * API:
 *   GET    /task?page=&limit=&search=&priority=&categoryId=&includeArchived=
 *   DELETE /task/:id
 *   GET    /category
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Animated,
    RefreshControl, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UniversalTaskCard from '../../components/common/UniversalTaskCard';
import { completeSchedule, undoCompleteSchedule } from '../../api/schedule.api';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { EmptyState } from '../../components/common/EmptyState';
import API from '../../api/client';

const { width: W } = Dimensions.get('window');
const LIMIT = 10;

const PRIORITY_OPTS = [
    { value: 'ALL', label: 'All', icon: 'format-list-bulleted' },
    { value: 'HIGH', label: 'High', icon: 'arrow-up-bold', color: '#f97316' },
    { value: 'MEDIUM', label: 'Medium', icon: 'minus', color: '#eab308' },
    { value: 'LOW', label: 'Low', icon: 'arrow-down-bold', color: '#00cc88' },
];

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function Skeleton({ style }) {
    const { isDark } = useTheme();
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])).start();
    }, []);
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.50] });
    return <Animated.View style={[{
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        opacity,
    }, style]} />;
}

function SkeletonList() {
    return (
        <View style={{ gap: 8 }}>
            {[72, 88, 72, 80, 72, 88].map((h, i) => (
                <Skeleton key={i} style={{ height: h, borderRadius: 18 }} />
            ))}
        </View>
    );
}

/* ── Section header ───────────────────────────────────────────────────────── */
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


// DeleteSheet removed in favor of global Alert system

/* ── Pagination ───────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPrev, onNext, onPage, isDark, cyan, glassBg, glassBord }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
        .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
            acc.push(p);
            return acc;
        }, []);

    return (
        <View style={[styles.pagination, { backgroundColor: glassBg, borderColor: glassBord }]}>
            <TouchableOpacity
                onPress={onPrev}
                disabled={page === 1}
                style={[styles.pageArrow, { borderColor: glassBord, opacity: page === 1 ? 0.30 : 1 }]}
            >
                <Icon name="chevron-left" size={16}
                    color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'} />
            </TouchableOpacity>

            <View style={styles.pageNums}>
                {pages.map((p, idx) => p === '…' ? (
                    <Text key={`e${idx}`} style={[styles.ellipsis, {
                        color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
                    }]}>
                        …
                    </Text>
                ) : (
                    <TouchableOpacity
                        key={p}
                        onPress={() => onPage(p)}
                        style={[styles.pageBtn, {
                            backgroundColor: page === p ? cyan : 'transparent',
                            borderColor: page === p ? cyan : glassBord,
                        }]}
                    >
                        <Text style={[styles.pageBtnTxt, {
                            color: page === p ? '#000' : (isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)'),
                            fontWeight: page === p ? '900' : '600',
                        }]}>
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                onPress={onNext}
                disabled={page === totalPages}
                style={[styles.pageArrow, { borderColor: glassBord, opacity: page === totalPages ? 0.30 : 1 }]}
            >
                <Icon name="chevron-right" size={16}
                    color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'} />
            </TouchableOpacity>
        </View>
    );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ════════════════════════════════════════════════════════════════════════════ */
export default function TasksScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { alert } = useAlert();
    const cyan = theme.cyan ?? '#00d4ff';

    /* state */
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [showArchived, setShowArchived] = useState(false);

    const debounceRef = useRef(null);

    /* glass tokens */
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
    const textColor = theme.text ?? '#fff';

    /* ── fetch ── */
    const fetchTasks = useCallback(async ({ pg = 1, reset = false, silent = false } = {}) => {
        // Only show skeleton if we have no tasks and it's not a pull-to-refresh
        if (!silent && tasks.length === 0 && !refreshing) setLoading(true);
        try {
            const params = {
                page: pg, limit: LIMIT,
                ...(search ? { search } : {}),
                ...(filterPriority !== 'ALL' ? { priority: filterPriority } : {}),
                ...(filterCategory !== 'ALL' ? { categoryId: filterCategory } : {}),
                includeArchived: showArchived ? 'true' : 'false',
            };
            const [taskRes, catRes] = await Promise.all([
                API.get('/task', { params }),
                reset ? API.get('/category') : Promise.resolve(null),
            ]);
            const raw = taskRes.data?.data || taskRes.data || {};
            setTasks((raw.tasks || []).map(t => ({ ...t, isCompleted: t.status === 'COMPLETED' })));
            setMeta(raw.meta || null);
            if (catRes) setCategories(catRes.data?.data || catRes.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); setRefreshing(false); }
    }, [search, filterPriority, filterCategory, showArchived, tasks, refreshing]);

    /* Initial load + refocus refresh */
    useFocusEffect(
        useCallback(() => {
            // Background refresh if we already have tasks
            fetchTasks({
                pg: page,
                reset: page === 1,
                silent: tasks.length > 0
            });
        }, [page, fetchTasks, tasks.length])
    );

    /* Filter changes → debounce → reset to page 1 */
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchTasks({ pg: 1, reset: true });
        }, 320);
        return () => clearTimeout(debounceRef.current);
    }, [search, filterPriority, filterCategory, showArchived]);

    const onRefresh = () => { setRefreshing(true); fetchTasks({ pg: page, reset: true }); };

    /* ── status toggle ── */
    const handleToggleComplete = async (task) => {
        try {
            const isCompleted = task.status === 'COMPLETED';
            const today = new Date().toISOString().slice(0, 10);
            if (isCompleted) {
                await undoCompleteSchedule(task.id, today);
            } else {
                await completeSchedule(task.id, today);
            }
            fetchTasks({ pg: page, silent: true });
        } catch (e) {
            console.error(e);
        }
    };

    /* ── delete ── */
    const handleDelete = async (task) => {
        alert(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/task/${task.id}`);
                            fetchTasks({ pg: page, silent: true });
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            ]
        );
    };

    /* ── grouped tasks ── */
    const scheduled = useMemo(() => tasks.filter(t => t.schedule), [tasks]);
    const unscheduled = useMemo(() => tasks.filter(t => !t.schedule), [tasks]);
    const isFiltering = !!(search || filterPriority !== 'ALL' || filterCategory !== 'ALL' || showArchived);

    /* total count label */
    const totalLabel = meta?.totalCount != null
        ? `${meta.totalCount} task${meta.totalCount !== 1 ? 's' : ''}`
        : tasks.length > 0 ? `${tasks.length} tasks` : 'All tasks';

    return (
        <View style={[styles.root, { backgroundColor: theme.bg ?? '#0a0a0a' }]}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scroll,
                    { paddingTop: insets.top + 16 },
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={cyan}
                        progressViewOffset={insets.top}
                    />
                }
                keyboardShouldPersistTaps="handled"
            >

                {/* ── PAGE TITLE ── */}
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
                        <Icon name="format-list-checks" size={18} color={cyan} />
                    </View>
                    <View>
                        <Text style={[styles.pageTitle, { color: textColor }]}>TASKS</Text>
                        <Text style={[styles.pageSub, {
                            color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
                        }]}>
                            {loading ? 'Loading…' : totalLabel}
                        </Text>
                    </View>
                </View>

                {/* ── SEARCH ── */}
                <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBord }]}>
                    <Icon
                        name="magnify"
                        size={17}
                        color={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                        style={{ marginLeft: 14 }}
                    />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search tasks…"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)'}
                        style={[styles.searchInput, { color: textColor }]}
                        returnKeyType="search"
                        clearButtonMode="never"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 14 }}>
                            <Icon
                                name="close-circle"
                                size={16}
                                color={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.26)'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── FILTER CHIPS ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterRow}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Priority */}
                    {PRIORITY_OPTS.map(opt => {
                        const active = filterPriority === opt.value;
                        const accent = opt.color || cyan;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                onPress={() => setFilterPriority(opt.value)}
                                activeOpacity={0.75}
                                style={[styles.chip, {
                                    backgroundColor: active
                                        ? accent + (isDark ? '1E' : '14')
                                        : glassBg,
                                    borderColor: active ? accent + '55' : glassBord,
                                }]}
                            >
                                <Icon
                                    name={opt.icon}
                                    size={10}
                                    color={active ? accent : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)')}
                                />
                                <Text style={[styles.chipTxt, {
                                    color: active ? accent : (isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.40)'),
                                    fontWeight: active ? '900' : '700',
                                }]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    <View style={[styles.divider, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }]} />



                    {/* Per-category */}
                    {categories.map(cat => {
                        const active = filterCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setFilterCategory(active ? 'ALL' : cat.id)}
                                activeOpacity={0.75}
                                style={[styles.chip, {
                                    backgroundColor: active ? cyan + (isDark ? '1E' : '14') : glassBg,
                                    borderColor: active ? cyan + '55' : glassBord,
                                }]}
                            >
                                <Text style={[styles.chipTxt, {
                                    color: active ? cyan : (isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.40)'),
                                    fontWeight: active ? '900' : '700',
                                }]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    <View style={[styles.divider, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }]} />

                    {/* Archived toggle */}
                    <TouchableOpacity
                        onPress={() => setShowArchived(v => !v)}
                        activeOpacity={0.75}
                        style={[styles.chip, {
                            backgroundColor: showArchived ? 'rgba(168,85,247,0.14)' : glassBg,
                            borderColor: showArchived ? 'rgba(168,85,247,0.35)' : glassBord,
                        }]}
                    >
                        <Icon
                            name="archive-outline"
                            size={10}
                            color={showArchived ? '#a855f7' : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.30)')}
                        />
                        <Text style={[styles.chipTxt, {
                            color: showArchived ? '#a855f7' : (isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.40)'),
                            fontWeight: showArchived ? '900' : '700',
                        }]}>
                            Archived
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* ── TASK LIST ── */}
                {loading ? (
                    <SkeletonList />
                ) : tasks.length === 0 ? (
                    <EmptyState
                        title={isFiltering ? 'No matches found' : 'No tasks yet'}
                        description={isFiltering ? 'Try adjusting your filters or search.' : 'Add your first task to get started.'}
                        icon={isFiltering ? 'magnify-close' : 'clipboard-text-outline'}
                        action={!isFiltering ? {
                            label: 'Add Task',
                            onPress: () => navigation.navigate('CreateTask')
                        } : null}
                    />
                ) : (
                    <View>
                        {/* Scheduled Tasks */}
                        {scheduled.length > 0 && (
                            <View style={styles.group}>
                                <SectionLabel
                                    icon="calendar-clock"
                                    iconColor={cyan}
                                    label="SCHEDULED TASKS"
                                    count={scheduled.length}
                                    isDark={isDark}
                                />
                                {scheduled.map(task => (
                                    <UniversalTaskCard
                                        key={task.id}
                                        item={task}
                                        onPress={t => navigation.navigate('TaskDetail', { task: t })}
                                        onEdit={t => navigation.navigate('CreateTask', { task: t })}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Unscheduled Tasks */}
                        {unscheduled.length > 0 && (
                            <View style={styles.group}>
                                <SectionLabel
                                    icon="inbox-full"
                                    iconColor={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
                                    label="UNSCHEDULED TASKS"
                                    count={unscheduled.length}
                                    isDark={isDark}
                                />
                                {unscheduled.map(task => (
                                    <UniversalTaskCard
                                        key={task.id}
                                        item={task}
                                        onPress={t => navigation.navigate('TaskDetail', { task: t })}
                                        onEdit={t => navigation.navigate('CreateTask', { task: t })}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ── PAGINATION ── */}
                {meta && meta.totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={meta.totalPages}
                        onPrev={() => setPage(p => Math.max(1, p - 1))}
                        onNext={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        onPage={p => setPage(p)}
                        isDark={isDark}
                        cyan={cyan}
                        glassBg={glassBg}
                        glassBord={glassBord}
                    />
                )}

                <View style={{ height: 150 }} />
            </ScrollView>

            {/* ── FAB ── */}
            <TouchableOpacity
                onPress={() => navigation.navigate('CreateTask')}
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
        </View>
    );
}

/* ── styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 20 },

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

    searchRow: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    searchInput: {
        flex: 1, height: '100%',
        fontSize: 14, fontWeight: '500',
        paddingHorizontal: 12,
    },

    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 18,
        gap: 7,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 10,
        gap: 5,
    },
    chipTxt: { fontSize: 10, letterSpacing: 0.5 },
    divider: { width: 1, height: 20, borderRadius: 1, marginHorizontal: 2 },

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

    emptyWrap: { alignItems: 'center', paddingVertical: 56 },
    emptyIcon: {
        width: 82, height: 82,
        borderRadius: 28, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    emptySub: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19, marginBottom: 22 },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 18,
    },
    emptyBtnTxt: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4 },

    pagination: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: 20, borderWidth: 1,
        padding: 8, marginBottom: 12, gap: 6,
    },
    pageArrow: {
        width: 36, height: 36,
        borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    pageNums: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pageBtn: {
        width: 32, height: 32,
        borderRadius: 10, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    pageBtnTxt: { fontSize: 12 },
    ellipsis: { fontSize: 13, fontWeight: '600', paddingHorizontal: 2 },

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

    confirmTxt: { color: '#fff', fontSize: 15, fontWeight: '900' },
});