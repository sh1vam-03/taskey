/**
 * BehaviorSection -- TASKTIME
 * Section 3. Score ring · AI explanation · 7d chart · Mini stats · Day browser · Log sheet
 *
 * Bugs fixed vs previous version:
 *  - ScoreRing track stroke now respects isDark (was hardcoded white)
 *  - miniTop: removed conflicting borderTopWidth, now uses plain backgroundColor
 *  - miniCard: removed borderTopColor on the card itself (was conflicting with borderColor)
 *  - All glass tokens consistent with AppHeader / CustomTabBar
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Platform,
} from 'react-native';
import Svg, {
    Circle, G, Defs, LinearGradient, Stop, Line, Path,
} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    getBehaviorLog, getLatestBehaviorLog,
    getBehaviorSummary, getBehaviorExplanation, saveBehaviorLog,
} from '../../../api/behavior.api';
import BehaviorLogSheet from '../components/BehaviorLogSheet';
import { useTheme } from '../../../context/ThemeContext';

/* ─── Animated score ring ─────────────────────────────────────────────────── */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ScoreRing({ score = 0, size = 160, strokeWidth = 14, loading = false, selectedDate }) {
    const { isDark } = useTheme();
    const anim = useRef(new Animated.Value(0)).current;

    // Animate score changes
    useEffect(() => {
        if (!loading) {
            Animated.timing(anim, {
                toValue: score, duration: 1100, useNativeDriver: true,
            }).start();
        } else {
            anim.setValue(0);
        }
    }, [score, loading, anim]);

    const radius = (size - strokeWidth) / 2;
    const circ = radius * 2 * Math.PI;
    const offset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

    const ringColor =
        score >= 80 ? '#22c55e' // text-green-500
            : score >= 60 ? '#06b6d4' // text-cyan-500
                : score >= 40 ? '#eab308' // text-yellow-500
                    : '#ef4444'; // text-red-500

    const trackStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const labelColor = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isToday = selectedDate === todayStr;
    const d = new Date(selectedDate);
    // e.g. "Oct 12"
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 12 }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2},${size / 2}`}>
                    <Circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={trackStroke}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {!loading && (
                        <AnimatedCircle
                            cx={size / 2} cy={size / 2} r={radius}
                            stroke={ringColor}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    )}
                </G>
            </Svg>

            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                {loading ? (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#06b6d4', opacity: 0.8 }}>CALCULATING...</Text>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 44, fontWeight: '900', color: ringColor, letterSpacing: -1 }}>
                            {Math.round(score)}
                        </Text>
                        <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                            <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1, color: labelColor, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                                {isToday ? "TODAY'S SCORE" : `SCORE FOR ${dateFormatted.toUpperCase()}`}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

/* ─── Date Parsing Helpers ─────────────────────────────────────────────────── */
const parseDateString = (str) => {
    if (!str) return new Date();
    const [y, m, d] = str.split('-');
    return new Date(y, m - 1, d);
};
const formatToDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/* ─── Mini area chart (7-day behavior history) ────────────────────────────── */
function MiniAreaChart({ data, color, height = 100 }) {
    const { isDark } = useTheme();
    if (!data || data.length < 2) return null;

    const W = 280;
    const max = Math.max(...data.map(d => d.behaviorScore || 0), 10);
    const stepX = W / (data.length - 1);
    const getY = v => height - (v / max) * height;
    const gridLine = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    let line = '', area = '';
    data.forEach((d, i) => {
        const x = i * stepX;
        const y = getY(d.behaviorScore || 0);
        if (i === 0) { line = `M${x},${y}`; area = `M${x},${height} L${x},${y}`; }
        else { line += ` L${x},${y}`; area += ` L${x},${y}`; }
    });
    area += ` L${(data.length - 1) * stepX},${height} Z`;

    return (
        <Svg width={W} height={height} style={{ alignSelf: 'center' }}>
            <Defs>
                <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={color} stopOpacity="0.35" />
                    <Stop offset="1" stopColor={color} stopOpacity="0" />
                </LinearGradient>
            </Defs>
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <Line key={i} x1="0" y1={height * p} x2={W} y2={height * p}
                    stroke={gridLine} strokeWidth="1" />
            ))}
            <Path d={area} fill="url(#areaGrad)" />
            <Path d={line} stroke={color} strokeWidth="2.5" fill="transparent"
                strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
    );
}

/* ─── 5-day pill strip ────────────────────────────────────────────────────── */
function DayStrip({ selectedDate, onSelect }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const today = parseDateString(formatToDateString(new Date()));

    const selected = parseDateString(selectedDate);

    // Calculate 5-day window centered on selectedDate, clamped to Today
    let endWindow = new Date(selected);
    endWindow.setDate(selected.getDate() + 2);
    if (endWindow > today) {
        endWindow = new Date(today);
    }

    const days = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(endWindow);
        d.setDate(endWindow.getDate() - (4 - i));
        const str = formatToDateString(d);
        return {
            str,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            num: d.getDate(),
        };
    });

    return (
        <View style={styles.dayStrip}>
            {days.map(d => {
                const active = d.str === selectedDate;
                return (
                    <TouchableOpacity
                        key={d.str}
                        onPress={() => onSelect(d.str)}
                        activeOpacity={0.75}
                        style={[styles.dayPill, {
                            backgroundColor: active ? cyan + '22' : 'transparent',
                            borderColor: active ? cyan + '66'
                                : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
                        }]}
                    >
                        <Text style={[styles.dayLabel, {
                            color: active ? cyan : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'),
                        }]}>
                            {d.day}
                        </Text>
                        <Text style={[styles.dayNum, {
                            color: active ? cyan : (isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.55)'),
                        }]}>
                            {d.num}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

/* ─── Main section ────────────────────────────────────────────────────────── */
export default function BehaviorSection({ refreshing }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    // Consistent glass tokens — same as AppHeader / CustomTabBar
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';

    const todayStr = new Date().toLocaleDateString('en-CA');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [todayLog, setTodayLog] = useState(null);
    const [latestLog, setLatestLog] = useState(null);
    const [dayDetails, setDayDetails] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [chartPeriod, setChartPeriod] = useState(7); // default 7 days like web

    const fetchAll = async () => {
        setLoading(true);
        setDetailsLoading(true);
        try {
            const [sum, log, explain, latest] = await Promise.all([
                getBehaviorSummary(chartPeriod).then(r => r.data?.data || r.data),
                getBehaviorLog(todayStr).then(r => r.data?.data || r.data).catch(() => null),
                getBehaviorExplanation(todayStr).then(r => r.data?.data || r.data).catch(() => ({ explanation: '' })),
                getLatestBehaviorLog().then(r => r.data?.data || r.data).catch(() => null),
            ]);
            setSummary(sum);
            setTodayLog(log);
            setLatestLog(latest);
            if (selectedDate === todayStr) {
                setDayDetails(log);
                setExplanation(explain?.explanation || '');
            }
        } catch { /* silent */ }
        finally { setLoading(false); setDetailsLoading(false); }
    };

    // Re-fetch summary when chart period changes
    useEffect(() => {
        if (!summary) return;
        const updateSummary = async () => {
            try {
                const sum = await getBehaviorSummary(chartPeriod).then(r => r.data?.data || r.data);
                setSummary(sum);
            } catch { /* silent */ }
        };
        updateSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartPeriod]);

    const loadDay = async (date) => {
        setDetailsLoading(true);
        try {
            const [log, explain] = await Promise.all([
                getBehaviorLog(date).then(r => r.data?.data || r.data).catch(() => null),
                getBehaviorExplanation(date).then(r => r.data?.data || r.data).catch(() => null),
            ]);
            setDayDetails(log);
            setExplanation(explain?.explanation || '');
        } catch { /* silent */ }
        finally { setDetailsLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAll(); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (refreshing) fetchAll(); }, [refreshing]);

    const handleDaySelect = (date) => { setSelectedDate(date); loadDay(date); };

    const handleNextDay = () => {
        const next = parseDateString(selectedDate);
        next.setDate(next.getDate() + 1);
        const today = parseDateString(formatToDateString(new Date()));
        if (next <= today) {
            handleDaySelect(formatToDateString(next));
        }
    };

    const handlePrevDay = () => {
        const prev = parseDateString(selectedDate);
        prev.setDate(prev.getDate() - 1);
        handleDaySelect(formatToDateString(prev));
    };

    const onSave = async (payload) => {
        try {
            await saveBehaviorLog({ date: todayStr, ...payload });
            setSheetVisible(false);
            fetchAll();
        } catch { /* toast in real app */ }
    };

    const score = dayDetails?.behaviorScore || 0;
    const hasToday = !!todayLog;
    const history = summary?.history || [];


    return (
        <View>
            {/* ── Score ring + explanation ── */}
            <View style={[styles.card, { backgroundColor: glassBg, borderColor: glassBord },
            Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: isDark ? 4 : 10 },
                    shadowOpacity: isDark ? 0.08 : 0.05,
                    shadowRadius: isDark ? 14 : 15,
                },
                android: { elevation: isDark ? 3 : 4 },
            }),
            ]}>
                <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 2, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', textAlign: 'center', marginBottom: 8 }}>
                    DAILY BEHAVIOR SCORE
                </Text>

                <ScoreRing score={score} loading={loading || detailsLoading} selectedDate={selectedDate} />

                <View style={[styles.explainBox, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderColor: glassBord,
                }]}>
                    <Icon name="lightbulb-outline" size={14} color="#eab308"
                        style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={[styles.explainTxt, {
                        color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.70)',
                        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                        fontSize: 11,
                    }]}>
                        {loading || detailsLoading ? "Analyzing your activity..." : (explanation || 'No activity data provided for this day.')}
                    </Text>
                </View>

                {/* Log / Update pill button */}
                <TouchableOpacity
                    onPress={() => setSheetVisible(true)}
                    activeOpacity={0.80}
                    style={[styles.logBtn, {
                        backgroundColor: hasToday ? 'transparent' : cyan,
                        borderColor: hasToday ? cyan + '55' : 'transparent',
                        borderWidth: hasToday ? 1 : 0,
                        ...Platform.select({
                            ios: !hasToday ? {
                                shadowColor: cyan, shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.30, shadowRadius: 10,
                            } : {},
                        }),
                    }]}
                >
                    <Icon
                        name={hasToday ? 'pencil-outline' : 'plus'}
                        size={16}
                        color={hasToday ? cyan : '#000'}
                    />
                    <Text style={[styles.logBtnTxt, { color: hasToday ? cyan : '#000' }]}>
                        {hasToday ? 'Update Activity' : "Log Today's Activity"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── 7/30-day behavior trend chart ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={[styles.cardMicro, { marginBottom: 0, color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)' }]}>
                        {chartPeriod}-DAY PROGRESS
                    </Text>
                    <View style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 6, padding: 2 }}>
                        <TouchableOpacity onPress={() => setChartPeriod(7)} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: chartPeriod === 7 ? cyan : 'transparent' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: chartPeriod === 7 ? (isDark ? '#000' : '#fff') : (isDark ? '#aaa' : '#555') }}>7D</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setChartPeriod(30)} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: chartPeriod === 30 ? '#a855f7' : 'transparent' }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: chartPeriod === 30 ? '#fff' : (isDark ? '#aaa' : '#555') }}>30D</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {!history || history.length < 2 ? (
                    <View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 1 }}>NOT ENOUGH DATA YET</Text>
                    </View>
                ) : (
                    <MiniAreaChart data={history} color={chartPeriod === 7 ? cyan : '#a855f7'} height={100} />
                )}
            </View>

            {/* ── Sleep + Exercise mini-cards (square, no top bar) ── */}
            <View style={styles.miniRow}>
                {/* Sleep */}
                <View style={[styles.miniCard, { backgroundColor: glassBg, borderColor: glassBord }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={styles.webMiniLabel}>
                            SLEEP DURATION
                        </Text>
                        <Icon name="clock-outline" size={14} color="#a855f7" />
                    </View>

                    <View style={styles.miniValRow}>
                        {detailsLoading ? (
                            <Text style={[styles.miniValue, { color: theme.text ?? '#fff', fontSize: 20 }]}>...</Text>
                        ) : (
                            <>
                                <Text style={[styles.miniValue, { color: theme.text ?? '#fff' }]}>
                                    {dayDetails?.sleepHours ?? '—'}
                                </Text>
                                <Text style={[styles.miniUnit, { color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)' }]}>hrs</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Exercise */}
                <View style={[styles.miniCard, { backgroundColor: glassBg, borderColor: glassBord }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={styles.webMiniLabel}>
                            EXERCISE
                        </Text>
                        <Icon name="chart-bell-curve" size={14} color={cyan} />
                    </View>
                    <View style={styles.miniValRow}>
                        {detailsLoading ? (
                            <Text style={[styles.miniValue, { color: theme.text ?? '#fff', fontSize: 20 }]}>...</Text>
                        ) : (
                            dayDetails?.exercise ? (
                                <Text style={[styles.miniExStatus, { color: '#00cc88', flexDirection: 'row', alignItems: 'center' }]}>
                                    <Icon name="check-circle" size={18} color="#00cc88" style={{ marginRight: 2 }} /> DONE
                                </Text>
                            ) : (
                                <Text style={[styles.miniExStatus, { color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)' }]}>
                                    NO RECORD
                                </Text>
                            )
                        )}
                    </View>
                </View>
            </View>

            {/* ── Browse days strip ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={[styles.cardMicro, {
                        color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)', marginBottom: 0
                    }]}>
                        BROWSE DAYS
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 20 }}>
                        <TouchableOpacity onPress={handlePrevDay} style={{ padding: 6 }}>
                            <Icon name="chevron-left" size={18} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 11, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: isDark ? '#fff' : '#000', paddingHorizontal: 4 }}>
                            {new Date(parseDateString(selectedDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>

                        <TouchableOpacity
                            onPress={handleNextDay}
                            style={{ padding: 6, opacity: selectedDate >= formatToDateString(new Date()) ? 0.3 : 1 }}
                            disabled={selectedDate >= formatToDateString(new Date())}
                        >
                            <Icon name="chevron-right" size={18} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <DayStrip selectedDate={selectedDate} onSelect={handleDaySelect} />
            </View>

            {/* ── Bottom sheet ── */}
            <BehaviorLogSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onSave={onSave}
                currentLog={todayLog}
                latestLog={latestLog}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 22,
        borderWidth: 1,
        padding: 18,
        marginBottom: 12,
    },
    cardMicro: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 14,
    },

    /* explain box */
    explainBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    explainTxt: {
        flex: 1,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 18,
    },
    explainEmpty: {
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '500',
        marginVertical: 16,
    },

    /* log button */
    logBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 25,
        marginTop: 4,
        gap: 8,
    },
    webMiniLabel: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: '#888',
        flexWrap: 'wrap',
        flex: 1,
    },
    logBtnTxt: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },

    /* mini cards — square, no top bar */
    miniRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    miniCard: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 22,
        borderWidth: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    miniIconBadge: {
        width: 38,
        height: 38,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.8,
        marginBottom: 4,
    },
    miniValRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    miniValue: {
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 30,
    },
    miniUnit: {
        fontSize: 19,
        fontWeight: '700',
    },
    miniExStatus: {
        fontSize: 19,
        fontWeight: '900',
        letterSpacing: 0.8,
    },

    /* day strip */
    dayStrip: {
        flexDirection: 'row',
        gap: 4,
    },
    dayPill: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 4,
    },
    dayLabel: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dayNum: {
        fontSize: 16,
        fontWeight: '900',
    },
});