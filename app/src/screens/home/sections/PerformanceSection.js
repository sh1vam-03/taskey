/**
 * PerformanceSection -- TASKTIME
 * Section 4. Toggle · Asymmetric metric cards · Area chart · Insights
 *
 * Card layout (no coloured top bar — accent on icon badge only):
 *
 *  ┌──────────────┬──────────────────┐
 *  │  Completion  │                  │
 *  ├──────────────┤  Productivity    │
 *  │  Completed   │     (hero)       │
 *  └──────────────┴──────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Line, Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDailyPerformance, getWeeklyPerformance, getMonthlyPerformance } from '../../../api/dashboard.api';
import { useTheme } from '../../../context/ThemeContext';

/* ─── Multi-line area chart ───────────────────────────────────────────────── */
function AreaChart({ data, lines, height = 140 }) {
    const { isDark } = useTheme();
    if (!data || data.length < 2) {
        return (
            <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)', fontSize: 12 }}>
                    No data for this period.
                </Text>
            </View>
        );
    }
    const W = 320;
    const allV = data.flatMap(d => lines.map(l => d[l.key] || 0));
    const max = Math.max(...allV, 10);
    const step = W / (data.length - 1);
    const getY = v => height - (v / max) * height;
    const buildPaths = key => {
        let line = '', area = '';
        data.forEach((d, i) => {
            const x = i * step, y = getY(d[key] || 0);
            if (i === 0) { line = `M${x},${y}`; area = `M${x},${height} L${x},${y}`; }
            else { line += ` L${x},${y}`; area += ` L${x},${y}`; }
        });
        area += ` L${(data.length - 1) * step},${height} Z`;
        return { line, area };
    };
    const gridLine = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={{ width: '100%', overflow: 'hidden' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Svg width={Math.max(W, data.length * 28)} height={height}>
                    <Defs>
                        {lines.map(l => (
                            <LinearGradient key={`g-${l.key}`} id={`g-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={l.color} stopOpacity="0.35" />
                                <Stop offset="1" stopColor={l.color} stopOpacity="0" />
                            </LinearGradient>
                        ))}
                    </Defs>
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <Line key={i} x1="0" y1={height * p} x2={W} y2={height * p} stroke={gridLine} strokeWidth="1" />
                    ))}
                    {lines.map(l => {
                        const { line, area } = buildPaths(l.key);
                        return (
                            <React.Fragment key={l.key}>
                                <Path d={area} fill={`url(#g-${l.key})`} />
                                <Path d={line} stroke={l.color} strokeWidth="2.5" fill="transparent"
                                    strokeLinejoin="round" strokeLinecap="round" />
                            </React.Fragment>
                        );
                    })}
                </Svg>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 20 }}>
                {lines.map(l => (
                    <View key={l.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: l.color }} />
                        <Text style={{
                            fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
                            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)'
                        }}>
                            {l.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

/* ─── Hero metric card (right column) ────────────────────────────────────── */
function HeroMetricCard({ label, value, suffix, color, icon }) {
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

/* ─── Small metric card (stacked in left column) ─────────────────────────── */
function SmallMetricCard({ label, value, suffix, color, icon }) {
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
                    {suffix ? <Text style={[styles.smallSuffix, { color }]}>{suffix}</Text> : null}
                </View>
            </View>
        </View>
    );
}

/* ─── Insight row ─────────────────────────────────────────────────────────── */
function InsightRow({ text, type }) {
    const { isDark } = useTheme();
    const cfg = {
        positive: { bg: 'rgba(0,204,136,0.10)', border: 'rgba(0,204,136,0.25)', color: '#00cc88', icon: 'trending-up' },
        attention: { bg: 'rgba(255,68,68,0.10)', border: 'rgba(255,68,68,0.25)', color: '#ff4444', icon: 'alert-circle-outline' },
        neutral: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.20)', color: '#00d4ff', icon: 'chart-bar' },
    }[type] || {};
    return (
        <View style={[styles.insightRow, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Icon name={cfg.icon} size={16} color={cfg.color} style={{ marginRight: 10 }} />
            <Text style={[styles.insightTxt, {
                color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.68)',
            }]}>{text}</Text>
        </View>
    );
}

function getInsights(data) {
    if (!data) return [];
    const out = [];
    if (data.completionRate >= 80) out.push({ type: 'positive', text: "Excellent consistency! You're hitting your targets reliably." });
    else if (data.completionRate >= 50) out.push({ type: 'neutral', text: 'Good momentum. Try to improve your task completion rate slightly.' });
    else out.push({ type: 'attention', text: 'Focus needed. Your completion rate is below optimal levels.' });
    if (data.productivityScore >= 80) out.push({ type: 'positive', text: 'High Productivity Zone. Your focus metrics are outstanding.' });
    if (data.totalCompleted > 10) out.push({ type: 'neutral', text: `High volume: You've completed ${data.totalCompleted} tasks this period.` });
    return out;
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
const VIEWS = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default function PerformanceSection({ refreshing }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)';
    const micro = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.30)';

    const [view, setView] = useState('WEEKLY');
    const [cache, setCache] = useState({});
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchData = async (v) => {
        if (cache[v] && !refreshing) { setData(cache[v]); setLoading(false); return; }
        setLoading(true);
        try {
            const localDate = new Date().toLocaleDateString('en-CA');
            let res;
            if (v === 'DAILY') res = await getDailyPerformance(localDate).then(r => r.data?.data || r.data);
            else if (v === 'WEEKLY') res = await getWeeklyPerformance(localDate).then(r => r.data?.data || r.data);
            else {
                const d = new Date();
                res = await getMonthlyPerformance({ year: d.getFullYear(), month: d.getMonth() + 1, date: localDate })
                    .then(r => r.data?.data || r.data);
            }
            setData(res);
            setCache(c => ({ ...c, [v]: res }));
        } catch { setData(null); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(view); }, [view]);
    useEffect(() => { if (refreshing) fetchData(view); }, [refreshing]);

    const chartData = view === 'DAILY' ? data?.hourly || [] : view === 'WEEKLY' ? data?.daily || [] : data?.history || [];
    const chartLines = [
        { key: 'total', label: 'Assigned', color: '#8b5cf6' },
        { key: 'completed', label: 'Completed', color: '#00d4ff' },
        { key: 'missed', label: 'Missed', color: '#f43f5e' },
    ];

    const completionVal = loading ? '—' : (data?.completionRate ?? 0);
    const completedVal = loading ? '—' : (data?.totalCompleted ?? 0);
    const productivityVal = loading ? '—' : (data?.productivityScore ?? 0);

    return (
        <View style={{ marginBottom: 8 }}>

            {/* ── View toggle ── */}
            <View style={[styles.toggleRow, { backgroundColor: glassBg, borderColor: glassBord }]}>
                {VIEWS.map(v => {
                    const active = view === v;
                    return (
                        <TouchableOpacity key={v} onPress={() => setView(v)}
                            style={[styles.toggleBtn, active && { backgroundColor: cyan }]}>
                            <Text style={[styles.toggleTxt, {
                                color: active ? '#000' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)'),
                            }]}>{v}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Metric cards: two small left | productivity hero right ── */}
            <View style={styles.cardRow}>
                <View style={styles.leftCol}>
                    <SmallMetricCard label="Completion" value={completionVal} suffix="%" color={cyan} icon="chart-pie" />
                    <SmallMetricCard label="Completed" value={completedVal} color="#a855f7" icon="check-all" />
                </View>
                <HeroMetricCard label="Productivity" value={productivityVal} color="#eab308" icon="lightning-bolt" />
            </View>

            {/* ── Area chart ── */}
            <View style={[styles.card, {
                backgroundColor: glassBg,
                borderColor: glassBord,
            }, !isDark && {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
            }]}>
                <Text style={[styles.micro, { color: micro }]}>{view} PERFORMANCE</Text>
                {loading ? (
                    <View style={styles.chartSkeleton}>
                        {[40, 70, 55, 80, 60, 90, 50].map((h, i) => (
                            <View key={i} style={[styles.skelBar, {
                                height: h,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            }]} />
                        ))}
                    </View>
                ) : (
                    <AreaChart data={chartData} lines={chartLines} height={140} />
                )}
            </View>

            {/* ── Insights ── */}
            {!loading && data && (
                <View style={[styles.card, {
                    backgroundColor: glassBg,
                    borderColor: glassBord,
                }, !isDark && {
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
                }]}>
                    <Text style={[styles.micro, { color: micro }]}>AI INSIGHTS</Text>
                    {getInsights(data).map((ins, i) => (
                        <InsightRow key={i} text={ins.text} type={ins.type} />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    /* toggle */
    toggleRow: {
        flexDirection: 'row', borderRadius: 18, borderWidth: 1,
        padding: 4, marginBottom: 14,
    },
    toggleBtn: { flex: 1, borderRadius: 14, paddingVertical: 9, alignItems: 'center' },
    toggleTxt: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },

    /* asymmetric card row */
    cardRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'stretch' },

    /* left col: flex 10 ≈ 43% */
    leftCol: { flex: 10, gap: 10 },
    smallCard: {
        flex: 1, borderRadius: 18, borderWidth: 1,
        padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    smallIconBadge: {
        width: 36, height: 36, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    smallLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 4 },
    smallNum: { fontSize: 24, fontWeight: '900', lineHeight: 26 },
    smallSuffix: { fontSize: 13, fontWeight: '800' },

    /* hero: flex 10 ≈ 50% */
    heroCard: {
        flex: 9, borderRadius: 22, borderWidth: 1,
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

    /* shared card */
    card: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 12 },
    micro: { fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 14 },

    /* chart skeleton */
    chartSkeleton: {
        height: 140, flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'space-between', paddingHorizontal: 4,
    },
    skelBar: { flex: 1, borderRadius: 4, marginHorizontal: 3 },

    /* insights */
    insightRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8,
    },
    insightTxt: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});