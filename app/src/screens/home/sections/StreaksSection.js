/**
 * StreaksSection -- TASKTIME
 * Section 2.
 *
 * Card layout (no coloured top bar — accent lives on icon badge only):
 *
 *  ┌──────────────────┬──────────┐
 *  │                  │   Best   │
 *  │  Current (hero)  ├──────────┤
 *  │                  │  Active  │
 *  └──────────────────┴──────────┘
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStreaks, getStreakCalendar } from '../../../api/dashboard.api';
import { useTheme } from '../../../context/ThemeContext';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const MILESTONES = [7, 14, 30, 60, 90, 100, 365];

function getNextMilestone(current) {
    const next = MILESTONES.find(m => m > current) || 365;
    const progress = Math.min((current / next) * 100, 100);
    return { next, progress, remaining: next - current };
}

function getInsights(calendarData) {
    if (!calendarData || calendarData.length === 0) return [];
    const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let perfectCount = 0;
    calendarData.forEach(d => {
        if ((d.score === 100 && d.total > 0) || (d.score === undefined && d.count >= 4)) {
            perfectCount++;
            dayCounts[new Date(d.date).getDay()]++;
        }
    });
    const firstActive = calendarData.findIndex(d => d.total > 0 || d.count > 0);
    const relevant = firstActive >= 0 ? calendarData.slice(firstActive) : [];
    const consistency = Math.round((perfectCount / (relevant.length || 1)) * 100);
    const insights = [];
    if (consistency >= 80) insights.push('You are unstoppable! Extremely consistent.');
    else if (consistency >= 50) insights.push('Building good habits. Keep it up!');
    else insights.push('Try to perform tasks at least 3 days a week.');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDay = 0, maxCount = -1;
    Object.entries(dayCounts).forEach(([d, c]) => { if (c > maxCount) { maxCount = c; bestDay = +d; } });
    if (maxCount > 0) insights.push(`You are most productive on ${days[bestDay]}s.`);
    return insights;
}

/* ─── Hero card (left column, full height) ───────────────────────────────── */
function HeroCard({ value, label, icon, color }) {
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
            <View style={[styles.heroIconBadge, {
                backgroundColor: color + (isDark ? '20' : '16'),
                borderColor: color + '38',
            }]}>
                <Icon name={icon} size={22} color={color} />
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={[styles.heroNum, { color: theme.text ?? '#fff' }]}>{value}</Text>
                <Text style={[styles.heroDays, { color: color }]}>days</Text>
                <Text style={[styles.heroLabel, { color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)' }]}>
                    {label.toUpperCase()}
                </Text>
            </View>
            {/* ambient blob */}
            <View style={[styles.heroBlob, { backgroundColor: color }]} pointerEvents="none" />
        </View>
    );
}

/* ─── Small card (right column, stacked pair) ────────────────────────────── */
function SmallCard({ value, label, icon, color }) {
    const { theme, isDark } = useTheme();
    return (
        <View style={[styles.smallCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)',
        }, !isDark && {
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
        }]}>
            <View style={[styles.smallIconBadge, {
                backgroundColor: color + (isDark ? '1C' : '14'),
                borderColor: color + '30',
            }]}>
                <Icon name={icon} size={15} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.smallLabel, { color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)' }]}>
                    {label.toUpperCase()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                    <Text style={[styles.smallNum, { color: theme.text ?? '#fff' }]}>{value}</Text>
                    <Text style={[styles.smallUnit, { color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)' }]}>d</Text>
                </View>
            </View>
        </View>
    );
}

/* ─── Heatmap ─────────────────────────────────────────────────────────────── */
function Heatmap({ data }) {
    const { isDark } = useTheme();
    const getColor = c => {
        if (!c) return isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        if (c === 1) return 'rgba(0,212,255,0.22)';
        if (c === 2) return 'rgba(0,212,255,0.46)';
        if (c === 3) return 'rgba(0,212,255,0.70)';
        return '#00d4ff';
    };
    const cols = [];
    for (let i = 0; i < data.length; i += 7) cols.push(data.slice(i, i + 7));
    const mutedColor = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)';

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 4 }}>
                {cols.map((col, ci) => (
                    <View key={ci} style={{ flexDirection: 'column', marginRight: 3 }}>
                        {col.map((day, di) => (
                            <View key={di} style={{
                                width: 14, height: 14, borderRadius: 3, marginBottom: 3,
                                backgroundColor: getColor(Math.min(day.count ?? 0, 4)),
                            }} />
                        ))}
                    </View>
                ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: mutedColor }}>LESS</Text>
                <View style={{ flexDirection: 'row', marginHorizontal: 8 }}>
                    {[0, 1, 2, 3, 4].map(l => (
                        <View key={l} style={{ width: 10, height: 10, borderRadius: 2, marginHorizontal: 1.5, backgroundColor: getColor(l) }} />
                    ))}
                </View>
                <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: mutedColor }}>MORE</Text>
            </View>
        </View>
    );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function StreaksSection({ refreshing }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';
    const micro = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.30)';

    const [loading, setLoading] = useState(true);
    const [streakData, setStreakData] = useState(null);
    const [calendarData, setCalendarData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const date = new Date().toLocaleDateString('en-CA');
            const [s, cal] = await Promise.all([
                getStreaks(date).then(r => r.data?.data || r.data),
                getStreakCalendar(date).then(r => r.data?.data || r.data),
            ]);
            setStreakData(s);
            const arr = Object.entries(cal || {})
                .map(([d, st]) => ({ date: d, count: st.totalActivity || st.completed || 0, score: st.score || 0, total: st.total || 0 }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            setCalendarData(arr);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (refreshing) fetchData(); }, [refreshing]);

    if (loading) {
        const skelBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        return (
            <View style={styles.cardRow}>
                <View style={[styles.heroCard, { backgroundColor: skelBg, borderColor: 'transparent' }]} />
                <View style={styles.rightCol}>
                    <View style={[styles.smallCard, { backgroundColor: skelBg, borderColor: 'transparent' }]} />
                    <View style={[styles.smallCard, { backgroundColor: skelBg, borderColor: 'transparent' }]} />
                </View>
            </View>
        );
    }

    const { next, progress, remaining } = getNextMilestone(streakData?.currentStreak || 0);
    const insights = getInsights(calendarData);

    return (
        <View>
            {/* ── Hero left | Best + Active stacked right ── */}
            <View style={styles.cardRow}>
                <HeroCard value={streakData?.currentStreak ?? 0} label="Current Streak" icon="fire" color="#f97316" />
                <View style={styles.rightCol}>
                    <SmallCard value={streakData?.longestStreak ?? 0} label="Best" icon="trophy-outline" color="#eab308" />
                    <SmallCard value={streakData?.activeStreak ?? 0} label="Active" icon="calendar-check" color={cyan} />
                </View>
            </View>

            {/* ── Milestone bar ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <Text style={[styles.micro, { color: micro }]}>NEXT GOAL</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                    <Text style={[styles.milestoneBig, { color: theme.text ?? '#fff' }]}>{next} Days</Text>
                    <Text style={[styles.milestoneRemain, { color: cyan }]}>{remaining} left</Text>
                </View>
                <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
                    <Svg height="8" width="100%" style={StyleSheet.absoluteFill}>
                        <Defs>
                            <LinearGradient id="mg" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#00d4ff" stopOpacity="1" />
                                <Stop offset="1" stopColor="#a855f7" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width={`${progress}%`} height="8" fill="url(#mg)" rx="4" ry="4" />
                    </Svg>
                </View>
                <Text style={[styles.milestoneCaption, { color: micro }]}>
                    {remaining} days until your {next}-day milestone
                </Text>
            </View>

            {/* ── Insights ── */}
            {insights.length > 0 && (
                <View style={[styles.card, {
                    backgroundColor: glassBg,
                    borderColor: glassBord,
                }, !isDark && {
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
                }]}>
                    <Text style={[styles.micro, { color: micro }]}>STREAK HABITS</Text>
                    {insights.map((txt, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cyan, marginTop: 6, marginRight: 10 }} />
                            <Text style={[styles.insightTxt, { color: theme.text ?? '#fff' }]}>{txt}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* ── Heatmap ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <Text style={[styles.micro, { color: micro }]}>ACTIVITY LOG</Text>
                <Heatmap data={calendarData} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    /* asymmetric row */
    cardRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'stretch' },

    /* hero: flex 13 ≈ 57% */
    heroCard: {
        flex: 9, borderRadius: 22, borderWidth: 1,
        padding: 20, overflow: 'hidden', minHeight: 170,
    },
    heroIconBadge: {
        width: 48, height: 48, borderRadius: 16, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    heroBlob: {
        position: 'absolute', bottom: -35, right: -35,
        width: 110, height: 110, borderRadius: 55, opacity: 0.09,
    },
    heroNum: { fontSize: 52, fontWeight: '900', lineHeight: 54, letterSpacing: -2 },
    heroDays: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, marginBottom: 4 },
    heroLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },

    /* right col: flex 10 ≈ 43% */
    rightCol: { flex: 10, gap: 10 },
    smallCard: {
        flex: 1, borderRadius: 18, borderWidth: 1,
        padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    smallIconBadge: {
        width: 36, height: 36, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    smallLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 4 },
    smallNum: { fontSize: 26, fontWeight: '900', lineHeight: 28 },
    smallUnit: { fontSize: 12, fontWeight: '700' },

    /* shared */
    card: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 12 },
    micro: { fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 14 },

    /* milestone */
    milestoneBig: { fontSize: 24, fontWeight: '900' },
    milestoneRemain: { fontSize: 13, fontWeight: '700' },
    track: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    milestoneCaption: { fontSize: 12, fontWeight: '500', lineHeight: 18 },

    insightTxt: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 20 },
});