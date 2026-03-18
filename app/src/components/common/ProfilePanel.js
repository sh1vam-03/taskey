/**
 * ProfilePanel -- TASKTIME
 * Premium glass bottom-sheet. Same visual language as AppHeader + CustomTabBar.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Modal, Pressable, Platform, Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/auth.store';
import { useNavigation } from '@react-navigation/native';
import { getSettings } from '../../api/ai.api';

const { height: SCREEN_H } = Dimensions.get('window');

/* ── Plan badge colours ─────────────────────────────────────────────────── */
const PLAN_COLORS = {
    FREE: { bg: 'rgba(255,255,255,0.10)', border: 'rgba(255,255,255,0.20)', text: 'rgba(255,255,255,0.70)' },
    PRO: { bg: 'rgba(0,212,255,0.15)', border: 'rgba(0,212,255,0.35)', text: '#00d4ff' },
    PREMIUM: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.35)', text: '#a855f7' },
    TEAM: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.35)', text: '#eab308' },
};

/* ── Action row ─────────────────────────────────────────────────────────── */
function ActionRow({ iconName, label, onPress, color, isDark, cyan, showChevron = true }) {
    const iconBg = color
        ? color + '18'
        : (isDark ? 'rgba(0,212,255,0.10)' : 'rgba(0,212,255,0.07)');
    const iconBorder = color ? color + '30' : cyan + '28';
    const textColor = color || (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.80)');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.actionRow}>
            <View style={[styles.actionIconPill, { backgroundColor: iconBg, borderColor: iconBorder }]}>
                <Icon name={iconName} size={17} color={color || cyan} />
            </View>
            <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
            {showChevron && (
                <Icon name="chevron-right" size={16}
                    color={isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)'} />
            )}
        </TouchableOpacity>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function ProfilePanel({ visible, onClose }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);
    const navigation = useNavigation();
    const cyan = theme.cyan ?? '#00d4ff';

    /* slide animation */
    const slideY = useRef(new Animated.Value(SCREEN_H)).current;
    useEffect(() => {
        if (visible) {
            Animated.spring(slideY, {
                toValue: 0, speed: 18, bounciness: 3, useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideY, {
                toValue: SCREEN_H, duration: 260, useNativeDriver: true,
            }).start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    /* fetch AI credits */
    const [creditBalance, setCreditBalance] = useState(0);
    useEffect(() => {
        if (visible) {
            getSettings().then((res) => {
                const d = res?.data?.data ?? res?.data ?? {};
                setCreditBalance(d.creditBalance ?? 0);
            }).catch((err) => { console.log('ProfilePanel credits fetch err:', err?.message); });
        }
    }, [visible]);

    const navigateTo = (screen) => { onClose(); navigation.navigate(screen); };
    const handleLogout = () => { onClose(); logout?.(); };

    /* glass tokens */
    const sheetBg = isDark ? 'rgba(10,10,14,0.97)' : 'rgba(250,250,255,0.97)';
    const sheetBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const divBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

    /* avatar initials + plan */
    const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const plan = (user?.plan ?? 'FREE').toUpperCase();
    const planColor = PLAN_COLORS[plan] || PLAN_COLORS.FREE;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            {/* dim backdrop */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: sheetBg,
                        borderColor: sheetBord,
                        paddingBottom: insets.bottom + 20,
                        transform: [{ translateY: slideY }],
                        ...Platform.select({
                            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.25, shadowRadius: 24 },
                            android: { elevation: 20 },
                        }),
                    },
                ]}
            >
                {/* drag handle */}
                <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)' }]} />

                {/* ── PROFILE HEADER ── */}
                <View style={styles.profileRow}>
                    {/* Avatar with cyan ring glow */}
                    <View style={styles.avatarWrap}>
                        <View style={[styles.avatarRing, {
                            borderColor: cyan + '55',
                            ...Platform.select({
                                ios: { shadowColor: cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 12 },
                            }),
                        }]}>
                            <View style={[styles.avatar, { backgroundColor: cyan + '1A' }]}>
                                <Text style={[styles.avatarTxt, { color: cyan }]}>{initials}</Text>
                            </View>
                        </View>
                        {/* Online dot */}
                        <View style={[styles.onlineDot, { backgroundColor: '#00cc88', borderColor: sheetBg }]} />
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text ?? '#fff' }]} numberOfLines={1}>
                            {user?.name ?? 'User'}
                        </Text>
                        <Text style={[styles.userEmail, { color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)' }]} numberOfLines={1}>
                            {user?.email ?? 'email@example.com'}
                        </Text>

                        {/* Plan badge */}
                        <View style={[styles.planBadge, {
                            backgroundColor: planColor.bg,
                            borderColor: planColor.border,
                        }]}>
                            <View style={[styles.planDot, { backgroundColor: planColor.text }]} />
                            <Text style={[styles.planTxt, { color: planColor.text }]}>{plan}</Text>
                        </View>
                    </View>
                </View>

                {/* ── AI CREDITS ── */}
                <View style={[styles.creditsRow, {
                    backgroundColor: isDark ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.04)',
                    borderColor: cyan + '25',
                }]}>
                    <View style={[styles.creditsIcon, { backgroundColor: cyan + '18' }]}>
                        <Icon name="lightning-bolt" size={16} color={cyan} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                            AI CREDITS
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: cyan, letterSpacing: -0.5, marginTop: 1 }}>
                            {creditBalance}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                        AVAILABLE
                    </Text>
                </View>

                {/* ── DIVIDER ── */}
                <View style={[styles.divider, { backgroundColor: divBg }]} />

                {/* ── ACTION ROWS ── */}
                <View style={styles.section}>
                    <ActionRow iconName="credit-card-outline" label="Billing & Usage" onPress={() => navigateTo('Billing')} isDark={isDark} cyan={cyan} />
                    <ActionRow iconName="cog-outline" label="Settings" onPress={() => navigateTo('Settings')} isDark={isDark} cyan={cyan} />
                </View>

                {/* ── DIVIDER ── */}
                <View style={[styles.divider, { backgroundColor: divBg }]} />

                {/* ── LOGOUT ── */}
                <View style={[styles.section, { paddingBottom: 4 }]}>
                    <ActionRow
                        iconName="logout"
                        label="Log Out"
                        onPress={handleLogout}
                        color="#ff4444"
                        showChevron={false}
                        isDark={isDark}
                        cyan={cyan}
                    />
                </View>

                {/* ── VERSION ── */}
                <Text style={[styles.version, { color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)' }]}>
                    TASKTIME · v1.0.0
                </Text>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingHorizontal: 24,
        paddingTop: 6,
    },

    /* handle */
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 22,
    },

    /* profile */
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },
    avatarWrap: {
        position: 'relative',
        marginRight: 16,
    },
    avatarRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1.5,
        padding: 3,
    },
    avatar: {
        flex: 1,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTxt: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2, right: 2,
        width: 12, height: 12,
        borderRadius: 6,
        borderWidth: 2,
    },

    /* user info */
    userInfo: { flex: 1 },
    userName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 2 },
    userEmail: { fontSize: 12, fontWeight: '500', marginBottom: 8 },

    /* plan badge */
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 9,
        paddingVertical: 3,
        gap: 5,
    },
    planDot: { width: 5, height: 5, borderRadius: 2.5 },
    planTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    /* divider */
    divider: { height: 1, marginVertical: 4 },

    /* credits */
    creditsRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 14, borderRadius: 16, borderWidth: 1,
        marginBottom: 6, marginTop: 2,
    },
    creditsIcon: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },

    /* section */
    section: { paddingVertical: 10 },
    sectionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 12 },

    /* action rows */
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        gap: 14,
    },
    actionIconPill: {
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

    /* version */
    version: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 18,
        marginBottom: 4,
    },
});