/**
 * HomeScreen -- TASKTIME
 * Premium floating-glass dashboard.
 * AppHeader floats above · 4 sections flow in one ScrollView · ProfilePanel slides in.
 */

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    RefreshControl, Dimensions, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import AppHeader, { HEADER_HEIGHT } from '../../components/common/AppHeader';
import ProfilePanel from '../../components/common/ProfilePanel';
import SectionHeader from './components/SectionHeader';
import OverviewSection from './sections/OverviewSection';
import StreaksSection from './sections/StreaksSection';
import BehaviorSection from './sections/BehaviorSection';
import PerformanceSection from './sections/PerformanceSection';

const { width: W } = Dimensions.get('window');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const [profileVisible, setProfileVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 5 ? 'Good night'
            : hour < 12 ? 'Good morning'
                : hour < 17 ? 'Good afternoon'
                    : 'Good evening';

    const fullDate = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2400);
    }, []);

    // Same glass tokens as CustomTabBar / AppHeader
    // Consistent glass tokens — matches AppHeader / Sections
    const glassFill = isDark ? 'rgba(18,18,22,0.82)' : '#ffffff';
    const glassStroke = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={[styles.root, { backgroundColor: isDark ? (theme.bg ?? '#000') : (theme.surface ?? '#f8fafc') }]}>
            {/* ── FLOATING PILL HEADER ────────────────────────────── */}
            <AppHeader
                showCalendar
                showProfile
                onProfilePress={() => setProfileVisible(true)}
            />

            {/* ── SCROLL BODY ─────────────────────────────────────── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scroll,
                    { paddingTop: insets.top + HEADER_HEIGHT + 16 },
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={cyan}
                        progressViewOffset={insets.top + HEADER_HEIGHT}
                    />
                }
            >

                {/* ── GREETING CARD ─────────────────────────────────── */}
                <View style={[
                    styles.greetCard,
                    { backgroundColor: glassFill, borderColor: glassStroke },
                    Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: isDark ? 6 : 10 },
                            shadowOpacity: isDark ? 0.10 : 0.05,
                            shadowRadius: isDark ? 20 : 15,
                        },
                        android: { elevation: isDark ? 6 : 4 },
                    }),
                ]}>
                    {/* Ambient glow blobs */}
                    <View style={[styles.blob1, { backgroundColor: cyan }]} pointerEvents="none" />
                    <View style={[styles.blob2, { backgroundColor: '#a855f7' }]} pointerEvents="none" />

                    {/* Date line */}
                    <Text style={[styles.dateLine, { color: theme.textMuted ?? '#777' }]}>
                        {fullDate.toUpperCase()}
                    </Text>

                    {/* Gradient greeting text */}
                    <Svg height={50} width={W - 84} style={{ marginTop: 2, marginBottom: 2 }}>
                        <Defs>
                            <LinearGradient id="greetGrad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor={isDark ? '#ffffff' : '#000000'} stopOpacity="1" />
                                <Stop offset="0.45" stopColor={isDark ? '#ffffff' : '#111111'} stopOpacity="1" />
                                <Stop offset="0.75" stopColor={cyan} stopOpacity="1" />
                                <Stop offset="1" stopColor="#a855f7" stopOpacity="0.9" />
                            </LinearGradient>
                        </Defs>
                        <SvgText
                            fill="url(#greetGrad)"
                            fontSize="24"
                            fontWeight="900"
                            x="0"
                            y="36"
                            letterSpacing="0"
                        >
                            {greeting} 👋
                        </SvgText>
                    </Svg>

                    {/* Accent divider */}
                    <View style={[styles.greetDivider, { backgroundColor: isDark ? cyan + '40' : cyan + '30' }]} />
                </View>

                {/* ── SECTION 1: OVERVIEW + TODAY TIMELINE ──────────── */}
                <SectionHeader title="Overview" icon="view-dashboard-outline" />
                <OverviewSection refreshing={refreshing} />

                {/* ── SECTION 2: STREAKS & HABITS ──────────────────── */}
                <SectionHeader title="Streaks & Habits" icon="fire" />
                <StreaksSection refreshing={refreshing} />

                {/* ── SECTION 3: BEHAVIOR SCORE ────────────────────── */}
                <SectionHeader title="Behavior Score" icon="brain" />
                <BehaviorSection refreshing={refreshing} />

                {/* ── SECTION 4: PERFORMANCE ───────────────────────── */}
                <SectionHeader title="Performance" icon="chart-line" />
                <PerformanceSection refreshing={refreshing} />

                {/* Tab bar spacer */}
                <View style={{ height: 130 }} />
            </ScrollView>

            {/* ── PROFILE PANEL ───────────────────────────────────── */}
            <ProfilePanel
                visible={profileVisible}
                onClose={() => setProfileVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 20 },

    greetCard: {
        borderRadius: 26,
        borderWidth: 1,
        padding: 22,
        paddingBottom: 18,
        overflow: 'hidden',
    },
    blob1: {
        position: 'absolute',
        top: -50, right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        opacity: 0.05,
    },
    blob2: {
        position: 'absolute',
        bottom: -40, right: 60,
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.03,
    },
    dateLine: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2.8,
        marginBottom: 2,
    },
    greetDivider: {
        height: 1,
        borderRadius: 1,
        marginTop: 16,
    },
});