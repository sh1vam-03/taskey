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

function ScoreRing({ score = 0, size = 150, strokeWidth = 11 }) {
    const { isDark } = useTheme();
    const anim = useRef(new Animated.Value(0)).current;
    const radius = (size - strokeWidth) / 2;
    const circ = radius * 2 * Math.PI;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: score, duration: 1100, useNativeDriver: true,
        }).start();
    }, [score]);

    const offset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

    const ringColor =
        score >= 80 ? '#00cc88'
            : score >= 60 ? '#00d4ff'
                : score >= 40 ? '#ffaa00'
                    : '#ff4444';

    // ✅ FIX: track stroke respects isDark
    const trackStroke = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)';
    const labelColor = isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.35)';

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2},${size / 2}`}>
                    <Circle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={trackStroke}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={size / 2} cy={size / 2} r={radius}
                        stroke={ringColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>
            <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 38, fontWeight: '900', color: ringColor }}>
                        {Math.round(score)}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: labelColor, marginTop: 2 }}>
                        TODAY'S SCORE
                    </Text>
                </View>
            </View>
        </View>
    );
}

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

/* ─── 7-day pill strip ────────────────────────────────────────────────────── */
function DayStrip({ selectedDate, onSelect }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const today = new Date();

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const str = d.toLocaleDateString('en-CA');
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
    const [sheetVisible, setSheetVisible] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [sum, log, explain, latest] = await Promise.all([
                getBehaviorSummary(7).then(r => r.data?.data || r.data),
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
        finally { setLoading(false); }
    };

    const loadDay = async (date) => {
        try {
            const [log, explain] = await Promise.all([
                getBehaviorLog(date).then(r => r.data?.data || r.data).catch(() => null),
                getBehaviorExplanation(date).then(r => r.data?.data || r.data).catch(() => null),
            ]);
            setDayDetails(log);
            setExplanation(explain?.explanation || '');
        } catch { /* silent */ }
    };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { if (refreshing) fetchAll(); }, [refreshing]);

    const handleDaySelect = (date) => { setSelectedDate(date); loadDay(date); };

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
                <ScoreRing score={score} />

                {explanation ? (
                    <View style={[styles.explainBox, {
                        backgroundColor: isDark ? 'rgba(234,179,8,0.06)' : 'rgba(234,179,8,0.04)',
                        borderColor: isDark ? 'rgba(234,179,8,0.20)' : 'rgba(234,179,8,0.18)',
                    }]}>
                        <Icon name="lightbulb-outline" size={14} color="#eab308"
                            style={{ marginRight: 8, marginTop: 1 }} />
                        <Text style={[styles.explainTxt, {
                            color: isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.55)',
                        }]}>
                            {explanation}
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.explainEmpty, {
                        color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.30)',
                    }]}>
                        {loading ? 'Loading score…' : 'Log your activity to see your score.'}
                    </Text>
                )}

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

            {/* ── 7-day behavior trend chart ── */}
            {history.length > 1 && (
                <View style={[styles.card, {
                    backgroundColor: glassBg,
                    borderColor: glassBord,
                }, !isDark && {
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
                }]}>
                    <Text style={[styles.cardMicro, {
                        color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)',
                    }]}>
                        7-DAY BEHAVIOR TREND
                    </Text>
                    <MiniAreaChart data={history} color={cyan} height={100} />
                </View>
            )}

            {/* ── Sleep + Exercise mini-cards (square, no top bar) ── */}
            <View style={styles.miniRow}>
                {/* Sleep */}
                <View style={[styles.miniCard, { backgroundColor: glassBg, borderColor: glassBord }]}>
                    {/* accent on icon badge only */}
                    <View style={[styles.miniIconBadge, {
                        backgroundColor: '#a855f7' + (isDark ? '20' : '16'),
                        borderColor: '#a855f7' + '38',
                    }]}>
                        <Icon name="weather-night" size={16} color="#a855f7" />
                    </View>
                    <Text style={[styles.miniLabel, {
                        color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)',
                    }]}>
                        SLEEP
                    </Text>
                    <View style={styles.miniValRow}>
                        <Text style={[styles.miniValue, { color: theme.text ?? '#fff' }]}>
                            {dayDetails?.sleepHours ?? '—'}
                        </Text>
                        <Text style={[styles.miniUnit, {
                            color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
                        }]}>hrs</Text>
                    </View>
                </View>

                {/* Exercise */}
                <View style={[styles.miniCard, { backgroundColor: glassBg, borderColor: glassBord }]}>
                    <View style={[styles.miniIconBadge, {
                        backgroundColor: (dayDetails?.exercise ? '#00cc88' : cyan) + (isDark ? '20' : '16'),
                        borderColor: (dayDetails?.exercise ? '#00cc88' : cyan) + '38',
                    }]}>
                        <Icon
                            name={dayDetails?.exercise ? 'check-circle' : 'run'}
                            size={16}
                            color={dayDetails?.exercise ? '#00cc88' : cyan}
                        />
                    </View>
                    <Text style={[styles.miniLabel, {
                        color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)',
                    }]}>
                        EXERCISE
                    </Text>
                    <Text style={[styles.miniExStatus, {
                        color: dayDetails?.exercise ? '#00cc88'
                            : (isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.35)'),
                    }]}>
                        {dayDetails?.exercise ? 'DONE' : 'NO LOG'}
                    </Text>
                </View>
            </View>

            {/* ── Browse days strip ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <Text style={[styles.cardMicro, {
                    color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)',
                }]}>
                    BROWSE DAYS
                </Text>
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