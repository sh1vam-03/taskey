/**
 * SectionHeader -- TASKTIME
 * Premium section divider with glass icon badge and split divider line.
 * Matches AppHeader/TabBar glass language exactly.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

export default function SectionHeader({ title, icon }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    // Glass badge tokens — matches AppHeader icon pill
    const badgeBg = isDark ? 'rgba(18,18,22,0.82)' : '#ffffff';
    const badgeBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)';

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>

                {/* Glass icon pill — identical token system to AppHeader */}
                {icon && (
                    <View style={[
                        styles.iconPill,
                        {
                            backgroundColor: badgeBg,
                            borderColor: badgeBorder,
                        },
                        Platform.select({
                            ios: {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isDark ? 0.20 : 0.04,
                                shadowRadius: isDark ? 8 : 4
                            },
                            android: { elevation: isDark ? 4 : 2 },
                        }),
                    ]}>
                        <Icon name={icon} size={14} color={cyan} />
                    </View>
                )}

                <Text style={[styles.title, { color: theme.text ?? '#fff' }]}>
                    {title.toUpperCase()}
                </Text>
            </View>

            {/* Three-layer divider: solid dot → mid fade → long fade */}
            <View style={styles.dividerRow}>
                <View style={[styles.divDot, { backgroundColor: cyan }]} />
                <View style={[styles.divMid, { backgroundColor: cyan + '44' }]} />
                <View style={[styles.divFade, { backgroundColor: cyan + '14' }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginTop: 36,
        marginBottom: 16,
        paddingHorizontal: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconPill: {
        width: 28,
        height: 28,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2.8,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divDot: { width: 20, height: 2.5, borderRadius: 1.5 },
    divMid: { width: 40, height: 1.5, borderRadius: 1, marginLeft: 2 },
    divFade: { flex: 1, height: 1, borderRadius: 1, marginLeft: 2 },
});