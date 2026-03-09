/**
 * AppHeader -- TASKTIME
 * Floating glass pill header — mirrors the CustomTabBar visual language.
 * Same H_MARGIN, same glass fill, same border radius system.
 */

import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Dimensions, Platform, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

// ─── Layout constants — must match CustomTabBar exactly ──────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_MARGIN = 20;
const BAR_WIDTH = SCREEN_WIDTH - H_MARGIN * 2;
const BAR_H = 62;
const PILL_R = BAR_H / 2;

// Export so screens can add correct top padding to clear the floating header
export const HEADER_HEIGHT = BAR_H + 16; // pill height + gap below it

// ─────────────────────────────────────────────────────────────────────────────

export default function AppHeader({
    title = 'TASKTIME',
    showCalendar = true,
    showProfile = true,
    onProfilePress,
    onAddPress,
}) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    // Glass colours — identical to CustomTabBar
    const glassFill = isDark ? 'rgba(12,12,14,0.96)' : 'rgba(255,255,255,0.98)';
    const glassStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    const cyan = theme.cyan ?? '#00d4ff';

    // Icon pill glass — same as floating circle in bottom bar
    const iconPillBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const iconBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';

    // Avatar specific
    const avatarBg = isDark ? `rgba(0,212,255,0.12)` : `rgba(0,150,200,0.10)`;
    const avatarBorder = isDark ? `rgba(0,212,255,0.40)` : `rgba(0,150,200,0.50)`;

    // Top safe-area padding so the pill sits just below the status bar
    const topPad = insets.top + 8;

    return (
        <>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={isDark ? 'light-content' : 'dark-content'}
            />

            {/* Purely floating — takes zero layout space, identical to bottom bar */}
            <View
                style={[styles.outer, { top: topPad }]}
                pointerEvents="box-none"
            >
                <View style={[
                    styles.pill,
                    {
                        backgroundColor: glassFill,
                        borderColor: glassStroke,
                    },
                ]}>

                    {/* ── LEFT SIDE ─────────────────────────────────────── */}
                    <View style={styles.side}>
                        {showCalendar && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Calendar')}
                                activeOpacity={0.7}
                                style={[styles.iconPill, { backgroundColor: iconPillBg, borderColor: iconBorder }]}
                            >
                                <Icon name="calendar-month-outline" size={19} color={theme.text ?? '#fff'} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── CENTER — TASKTIME wordmark ─────────────────────── */}
                    <View style={styles.center} pointerEvents="none">
                        {title === 'TASKTIME' ? (
                            <Svg height={BAR_H} width={180}>
                                <Defs>
                                    <LinearGradient id="hdrGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={isDark ? '#ffffff' : '#333333'} stopOpacity="1" />
                                        <Stop offset="0.5" stopColor={isDark ? '#e0e0e0' : '#111111'} stopOpacity="1" />
                                        <Stop offset="1" stopColor={isDark ? '#888888' : '#000000'} stopOpacity="1" />
                                    </LinearGradient>
                                </Defs>
                                <SvgText
                                    fill="url(#hdrGrad)"
                                    fontSize="20"
                                    fontWeight="900"
                                    x="90"
                                    y={BAR_H / 2 + 7}
                                    textAnchor="middle"
                                    letterSpacing="7"
                                >
                                    TASKTIME
                                </SvgText>
                            </Svg>
                        ) : (
                            <Text style={[styles.screenTitle, { color: theme.text ?? '#fff' }]}>
                                {title}
                            </Text>
                        )}
                    </View>

                    {/* ── RIGHT SIDE ────────────────────────────────────── */}
                    <View style={styles.side}>
                        <View style={styles.rightRow}>
                            {/* Optional + add button */}
                            {onAddPress && (
                                <TouchableOpacity
                                    onPress={onAddPress}
                                    activeOpacity={0.7}
                                    style={[styles.iconPill, { backgroundColor: `rgba(0,212,255,0.12)`, borderColor: avatarBorder, marginRight: 8 }]}
                                >
                                    <Icon name="plus" size={20} color={cyan} />
                                </TouchableOpacity>
                            )}

                            {/* Profile avatar pill */}
                            {showProfile && (
                                <TouchableOpacity
                                    onPress={onProfilePress}
                                    activeOpacity={0.7}
                                    style={[styles.avatar, { backgroundColor: avatarBg, borderColor: avatarBorder }]}
                                >
                                    <Icon name="account-outline" size={19} color={cyan} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    // Outer wrapper — floats at the top, same horizontal margin as bottom bar
    outer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
        alignItems: 'center',
        // no background — transparent so screen bg shows through
    },

    // The pill itself
    pill: {
        width: BAR_WIDTH,
        height: BAR_H,
        borderRadius: PILL_R,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.20,
                shadowRadius: 18,
            },
            android: { elevation: 14 },
        }),
    },

    // Left and right sides — fixed width so center stays truly centered
    side: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
    },

    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },

    // Center wordmark area
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Screen title (when title !== 'TASKTIME')
    screenTitle: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },

    // Small glass pill around each icon (matches floating circle style)
    iconPill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Profile avatar — same size, cyan-tinted border
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});