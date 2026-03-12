/**
 * PriorityBadge — TASKTIME
 * Compact priority pill used inside TaskCard and detail views.
 *
 * Props:
 *   priority  'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL'
 *   size      'sm' (default) | 'md'
 *   showIcon  boolean (default true)
 *   isDark    boolean (from ThemeContext)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PRIORITY_CONFIG = {
    HIGH: {
        color: '#f97316',
        icon: 'arrow-up-bold',
        label: 'HIGH',
        bg: (d) => d ? 'rgba(249,115,22,0.14)' : 'rgba(249,115,22,0.10)',
        border: 'rgba(249,115,22,0.40)',
    },
    MEDIUM: {
        color: '#eab308',
        icon: 'minus',
        label: 'MEDIUM',
        bg: (d) => d ? 'rgba(234,179,8,0.14)' : 'rgba(234,179,8,0.10)',
        border: 'rgba(234,179,8,0.40)',
    },
    LOW: {
        color: '#00cc88',
        icon: 'arrow-down-bold',
        label: 'LOW',
        bg: (d) => d ? 'rgba(0,204,136,0.14)' : 'rgba(0,204,136,0.10)',
        border: 'rgba(0,204,136,0.40)',
    },
    CRITICAL: {
        color: '#ff4444',
        icon: 'alert',
        label: 'CRITICAL',
        bg: (d) => d ? 'rgba(255,68,68,0.14)' : 'rgba(255,68,68,0.10)',
        border: 'rgba(255,68,68,0.40)',
    },
};

export default function PriorityBadge({ priority = 'MEDIUM', size = 'sm', showIcon = true, isDark = true }) {
    const cfg = PRIORITY_CONFIG[(priority || 'MEDIUM').toUpperCase()] || PRIORITY_CONFIG.MEDIUM;
    const isMd = size === 'md';

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: cfg.bg(isDark),
                borderColor: cfg.border,
                paddingHorizontal: isMd ? 10 : 7,
                paddingVertical: isMd ? 5 : 3,
                borderRadius: isMd ? 10 : 8,
            },
        ]}>
            {showIcon && <Icon name={cfg.icon} size={isMd ? 10 : 8} color={cfg.color} style={{ marginRight: 3 }} />}
            <Text style={[styles.label, { color: cfg.color, fontSize: isMd ? 10 : 9 }]}>{cfg.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    label: { fontWeight: '800', letterSpacing: 0.8 },
});