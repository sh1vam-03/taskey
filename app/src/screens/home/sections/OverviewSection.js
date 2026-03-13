/**
 * OverviewSection -- TASKTIME
 * Section 1.
 * ① 4 premium stat cards (2×2)
 * ② Today's Timeline — tasks & schedules in time order with completion toggle
 *
 * API:
 *   GET /dashboard/overview?date=YYYY-MM-DD  → { todayTasks, completedTasks, behaviorScore, currentStreak }
 *   GET /dashboard/today?date=YYYY-MM-DD     → { timeline: [...], stats: { total, completed, pending } }
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Dimensions,
} from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOverview, getToday } from '../../../api/dashboard.api';
import { completeTask, undoCompleteTask } from '../../../api/task.api';
import { completeSchedule, undoCompleteSchedule } from '../../../api/schedule.api';
import { useTheme } from '../../../context/ThemeContext';

const { width: W } = Dimensions.get('window');

/* ── skeleton pulse ───────────────────────────────────────────────────────── */
function Skeleton({ style }) {
    const { isDark } = useTheme();
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 820, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 820, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.60] });
    const bg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    return <Animated.View style={[{ backgroundColor: bg, opacity }, style]} />;
}

/* ── mini animated ring (shows ratio, used in stat cards) ─────────────────── */
const AnimCircle = Animated.createAnimatedComponent(Circle);
function MiniRing({ value = 0, max = 100, color, size = 46, stroke = 4 }) {
    const anim = useRef(new Animated.Value(0)).current;
    const radius = (size - stroke) / 2;
    const circ = radius * 2 * Math.PI;
    useEffect(() => {
        Animated.timing(anim, { toValue: value, duration: 1200, useNativeDriver: true }).start();
    }, [value]);
    const offset = anim.interpolate({
        inputRange: [0, max], outputRange: [circ, 0], extrapolate: 'clamp',
    });
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2},${size / 2}`}>
                    <Circle cx={size / 2} cy={size / 2} r={radius}
                        stroke={color + '28'} strokeWidth={stroke} fill="transparent" />
                    <AnimCircle cx={size / 2} cy={size / 2} r={radius}
                        stroke={color} strokeWidth={stroke} fill="transparent"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                </G>
            </Svg>
        </View>
    );
}

/* ── premium stat card ────────────────────────────────────────────────────── */
/* ── hero metric card (right column) ────────────────────────────────────── */
function HeroMetricCard({ label, value, suffix, color, icon, ring, ringMax }) {
    const { theme, isDark } = useTheme();
    return (
        <View style={[styles.heroCard, {
            backgroundColor: isDark ? color + '12' : '#ffffff',
            borderColor: isDark ? color + '30' : 'rgba(0,0,0,0.05)',
        }, Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isDark ? 8 : 10 },
                shadowOpacity: isDark ? 0.20 : 0.05,
                shadowRadius: isDark ? 20 : 15,
            },
            android: { elevation: isDark ? 6 : 4 },
        })]}>
            <View style={[
                styles.heroIconBadge,
                !ring && {
                    backgroundColor: color + (isDark ? '20' : '16'),
                    borderColor: color + '38',
                },
                ring && { borderWidth: 0 }
            ]}>
                {ring
                    ? <MiniRing value={value ?? 0} max={ringMax ?? 100} color={color} size={42} stroke={4} />
                    : <Icon name={icon} size={22} color={color} />
                }
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={[styles.heroLabel, { color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)' }]}>
                    {label.toUpperCase()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                    <Text style={[styles.heroNum, { color: theme.text ?? '#fff' }]}>{value}</Text>
                    {suffix ? <Text style={[styles.heroSuffix, { color }]}>{suffix}</Text> : null}
                </View>
            </View>
            <View style={[styles.heroBlob, { backgroundColor: color }]} pointerEvents="none" />
        </View>
    );
}

/* ── today progress bar ────────────────────────────────────────────────────── */
function TodayProgressBar({ completed, total, isDark, cyan }) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <View style={styles.progressWrap}>
            <View style={[styles.progressTrack, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
            }]}>
                <Svg height="6" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <LinearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor={cyan} stopOpacity="1" />
                            <Stop offset="1" stopColor="#a855f7" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width={`${pct}%`} height="6" fill="url(#pg)" rx="3" ry="3" />
                </Svg>
            </View>
            <Text style={[styles.progressLabel, {
                color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
            }]}>
                {completed} of {total} completed · {pct}%
            </Text>
        </View>
    );
}

/* ── priority colours ──────────────────────────────────────────────────────── */
const PRI = { HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#00cc88', CRITICAL: '#ff4444' };

/* ── timeline row ──────────────────────────────────────────────────────────── */
function TLItem({ item, isLast, onToggle }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const isDone = item.status === 'COMPLETED';
    const isMissed = item.status === 'MISSED';
    const isTask = item.type === 'UNSCHEDULED';

    const dotColor = isDone ? '#00cc88' : isMissed ? '#ff4444' : cyan;
    const priColor = PRI[item.priority] || '#888';
    const timeStr = item.startTime
        ? `${item.startTime.slice(0, 5)}${item.endTime ? ' – ' + item.endTime.slice(0, 5) : ''}`
        : 'All Day';

    const typeColor = isTask ? '#a855f7' : cyan;
    const typeBg = isTask
        ? (isDark ? 'rgba(168,85,247,0.14)' : 'rgba(168,85,247,0.09)')
        : (isDark ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.08)');

    const cardBg = isDone ? (isDark ? 'rgba(0,204,136,0.07)' : 'rgba(0,204,136,0.04)')
        : isMissed ? (isDark ? 'rgba(255,68,68,0.07)' : 'rgba(255,68,68,0.04)')
            : (isDark ? 'rgba(255,255,255,0.04)' : '#ffffff');
    const cardBord = isDone ? 'rgba(0,204,136,0.20)'
        : isMissed ? 'rgba(255,68,68,0.20)'
            : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)');

    return (
        <View style={styles.tlRow}>
            {/* gutter */}
            <View style={styles.tlGutter}>
                <View style={[styles.tlDot, {
                    backgroundColor: dotColor,
                    shadowColor: dotColor,
                }]} />
                {!isLast && (
                    <View style={[styles.tlLine, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    }]} />
                )}
            </View>

            {/* card */}
            <View style={[styles.tlCard, {
                backgroundColor: cardBg,
                borderColor: cardBord,
            }, !isDark && !isDone && !isMissed && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 1
            }]}>
                {/* top row: time + type pill */}
                <View style={styles.tlTopRow}>
                    <Text style={[styles.tlTime, { color: theme.textDim ?? '#555' }]}>{timeStr}</Text>
                    <View style={[styles.tlTypePill, { backgroundColor: typeBg }]}>
                        <Icon
                            name={isTask ? 'checkbox-marked-circle-outline' : 'calendar-clock'}
                            size={9} color={typeColor}
                        />
                        <Text style={[styles.tlTypeText, { color: typeColor }]}>
                            {isTask ? 'TASK' : 'EVENT'}
                        </Text>
                    </View>
                </View>

                {/* middle: priority · title · check */}
                <View style={styles.tlMid}>
                    <View style={[styles.priDot, { backgroundColor: priColor }]} />
                    <Text
                        style={[
                            styles.tlTitle,
                            isDone && { textDecorationLine: 'line-through', color: theme.textDim ?? '#555' },
                            isMissed && { textDecorationLine: 'line-through', color: '#ff444466' },
                            !isDone && !isMissed && { color: theme.text ?? '#fff' },
                        ]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>

                    {!isMissed && (
                        <TouchableOpacity
                            onPress={() => onToggle(item)}
                            activeOpacity={0.7}
                            style={[styles.tlCheck, {
                                backgroundColor: isDone ? '#00cc8820' : 'transparent',
                                borderColor: isDone ? '#00cc88' : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)'),
                            }]}
                        >
                            {isDone && <Icon name="check" size={12} color="#00cc88" />}
                        </TouchableOpacity>
                    )}
                    {isMissed && (
                        <View style={styles.missedBadge}>
                            <Text style={styles.missedText}>MISSED</Text>
                        </View>
                    )}
                </View>

                {/* category */}
                {item.category && (
                    <View style={styles.tlCatRow}>
                        <Icon name="tag-outline" size={9} color={theme.textDim ?? '#555'} />
                        <Text style={[styles.tlCatText, { color: theme.textDim ?? '#555' }]}>
                            {item.category?.name ?? item.category}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

/* ── MAIN ──────────────────────────────────────────────────────────────────── */
export default function OverviewSection({ refreshing }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';

    const [ovData, setOvData] = useState(null);
    const [todayData, setTodayData] = useState(null);
    const [loadOv, setLoadOv] = useState(true);
    const [loadTl, setLoadTl] = useState(true);
    const [error, setError] = useState(false);

    const fetchOverview = async () => {
        setLoadOv(true); setError(false);
        try {
            const date = new Date().toLocaleDateString('en-CA');
            const { data: r } = await getOverview(date);
            setOvData(r.data || r);
        } catch { setError(true); }
        finally { setLoadOv(false); }
    };

    const fetchToday = async () => {
        setLoadTl(true);
        try {
            const date = new Date().toLocaleDateString('en-CA');
            const { data: r } = await getToday(date);
            setTodayData(r.data || r);
        } catch { /* silent */ }
        finally { setLoadTl(false); }
    };

    useEffect(() => { fetchOverview(); fetchToday(); }, []);
    useEffect(() => { if (refreshing) { fetchOverview(); fetchToday(); } }, [refreshing]);

    /* ── optimistic toggle with silent sync ── */
    const handleToggle = useCallback(async (item) => {
        const willComplete = item.status !== 'COMPLETED';
        const date = new Date().toLocaleDateString('en-CA');

        // ① Optimistic Timeline Update
        setTodayData(prev => !prev ? prev : ({
            ...prev,
            timeline: prev.timeline.map(t =>
                (t.id === item.id || t.taskId === item.id || t.scheduleId === item.id)
                    ? { ...t, status: willComplete ? 'COMPLETED' : 'PENDING' }
                    : t
            ),
            stats: {
                ...prev.stats,
                completed: Math.max(0, (prev.stats?.completed || 0) + (willComplete ? 1 : -1))
            }
        }));

        // ② Optimistic Metric Cards Update
        setOvData(prev => !prev ? prev : ({
            ...prev,
            completedTasksCount: Math.max(0, (prev.completedTasksCount || 0) + (willComplete ? 1 : -1))
        }));

        try {
            if (item.type === 'UNSCHEDULED') {
                willComplete
                    ? await completeTask(item.taskId || item.id, date)
                    : await undoCompleteTask(item.taskId || item.id, date);
            } else {
                willComplete
                    ? await completeSchedule(item.scheduleId || item.id, date)
                    : await undoCompleteSchedule(item.scheduleId || item.id, date);
            }

            // ③ Silent Sync (no loading skeleton)
            const [resTl, resOv] = await Promise.all([
                getToday(date),
                getOverview(date)
            ]);
            setTodayData(resTl.data?.data || resTl.data);
            setOvData(resOv.data?.data || resOv.data);
        } catch (err) {
            console.warn("Toggle sync failed, reverting...", err);
            fetchToday(); // Noisy refetch on error to ensure consistency
            fetchOverview();
        }
    }, [cyan, fetchToday, fetchOverview]);

    /* ── sorted timeline ── */
    const timelineItems = (todayData?.timeline || [])
        .map(t => ({ ...t, id: t.id || t.taskId || t.scheduleId }))
        .sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
        });

    const stats = todayData?.stats || {};
    const totItems = stats.total ?? 0;
    const doneItm = stats.completed ?? 0;

    if (error) {
        return (
            <View style={[styles.errBox, {
                backgroundColor: isDark ? 'rgba(255,68,68,0.07)' : '#ffffff',
                borderColor: isDark ? '#ff444430' : 'rgba(255,68,68,0.20)',
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <Text style={{ color: '#ff4444', fontWeight: '700', marginBottom: 14 }}>Failed to load</Text>
                <TouchableOpacity
                    onPress={() => { fetchOverview(); fetchToday(); }}
                    style={[styles.retryBtn, { borderColor: '#ff444460' }]}
                >
                    <Text style={{ color: '#ff4444', fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
                        TRY AGAIN
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>
            {/* ── METRIC CARDS ── */}
            {loadOv && !refreshing ? (
                <View style={styles.cardRow}>
                    <Skeleton style={[styles.heroCard, { flex: 1 }]} />
                    <Skeleton style={[styles.heroCard, { flex: 1 }]} />
                </View>
            ) : (
                <View style={styles.cardRow}>
                    <HeroMetricCard
                        label="Today"
                        value={ovData?.todayTasksTotal ?? 0}
                        color={cyan}
                        icon="lightning-bolt"
                    />
                    <HeroMetricCard
                        label="Completed"
                        value={ovData?.completedTasksCount ?? 0}
                        color="#00cc88"
                        icon="check-all"
                        ring
                        ringMax={Math.max(ovData?.todayTasksTotal ?? 1, 1)}
                    />
                </View>
            )}

            {/* ── TODAY TIMELINE ── */}
            <View style={[styles.tlWrap, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>

                {/* header */}
                <View style={styles.tlHead}>
                    <View style={styles.tlHeadLeft}>
                        <View style={[styles.tlHeadBadge, { backgroundColor: cyan + '18', borderColor: cyan + '30' }]}>
                            <Icon name="calendar-today" size={13} color={cyan} />
                        </View>
                        <Text style={[styles.tlHeadTitle, { color: theme.text ?? '#fff' }]}>
                            Today's Events
                        </Text>
                    </View>
                    {!loadTl && (
                        <View style={[styles.countChip, { backgroundColor: cyan + '14', borderColor: cyan + '30' }]}>
                            <Text style={[styles.countText, { color: cyan }]}>{totItems} total</Text>
                        </View>
                    )}
                </View>

                {/* progress bar */}
                {!loadTl && totItems > 0 && (
                    <TodayProgressBar completed={doneItm} total={totItems} isDark={isDark} cyan={cyan} />
                )}

                {/* list */}
                {loadTl ? (
                    <View style={{ marginTop: 8 }}>
                        {[88, 66, 74].map((h, i) => (
                            <Skeleton key={i} style={{ height: h, borderRadius: 18, marginBottom: 10 }} />
                        ))}
                    </View>
                ) : timelineItems.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Icon name="calendar-blank-outline" size={38}
                            color={isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)'} />
                        <Text style={[styles.emptyText, { color: theme.textDim ?? '#555' }]}>
                            Nothing scheduled for today
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginTop: 8 }}>
                        {timelineItems.map((item, idx) => (
                            <TLItem
                                key={item.id || idx}
                                item={item}
                                isLast={idx === timelineItems.length - 1}
                                onToggle={handleToggle}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

/* ── styles ─────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
    /* symmetric dual-hero card row */
    cardRow: { flexDirection: 'row', gap: 12, marginHorizontal: -2, marginBottom: 14 },

    /* hero cards */
    heroCard: {
        flex: 1, borderRadius: 22, borderWidth: 1,
        padding: 20, overflow: 'hidden', minHeight: 140,
    },
    heroIconBadge: {
        width: 48, height: 48, borderRadius: 16, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    heroBlob: {
        position: 'absolute', bottom: -35, right: -35,
        width: 110, height: 110, borderRadius: 55, opacity: 0.09,
    },
    heroLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
    heroNum: { fontSize: 48, fontWeight: '900', lineHeight: 50, letterSpacing: -1.5 },
    heroSuffix: { fontSize: 18, fontWeight: '800' },

    /* error */
    errBox: { borderRadius: 22, borderWidth: 1, padding: 28, alignItems: 'center', marginBottom: 12 },
    retryBtn: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 10 },

    /* timeline wrapper */
    tlWrap: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 12 },

    /* header */
    tlHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    tlHeadLeft: { flexDirection: 'row', alignItems: 'center' },
    tlHeadBadge: {
        width: 26, height: 26, borderRadius: 9, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', marginRight: 10,
    },
    tlHeadTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2.5 },
    countChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    countText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

    /* progress */
    progressWrap: { marginBottom: 16 },
    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    progressLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

    /* empty */
    emptyWrap: { alignItems: 'center', paddingVertical: 32, gap: 10 },
    emptyText: { fontSize: 13, fontWeight: '500' },

    /* row */
    tlRow: { flexDirection: 'row', marginBottom: 10 },
    tlGutter: { width: 28, alignItems: 'center', paddingTop: 14 },
    tlDot: {
        width: 10, height: 10, borderRadius: 5, marginBottom: 4,
        shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.65, shadowRadius: 6, elevation: 4,
    },
    tlLine: { flex: 1, width: 1.5 },

    tlCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 12, paddingHorizontal: 14 },

    tlTopRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 7,
    },
    tlTime: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    tlTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    tlTypeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },

    tlMid: { flexDirection: 'row', alignItems: 'center' },
    priDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8, flexShrink: 0 },
    tlTitle: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },

    tlCheck: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center', marginLeft: 10, flexShrink: 0,
    },
    missedBadge: {
        marginLeft: 10, backgroundColor: 'rgba(255,68,68,0.15)',
        borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    },
    missedText: { fontSize: 9, fontWeight: '900', color: '#ff4444', letterSpacing: 0.8 },

    tlCatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 4 },
    tlCatText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
});