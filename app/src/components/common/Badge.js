/**
 * Badge -- TASKTIME
 * Premium glass pill badge. Auto-derives border + text from a single color prop.
 *
 * Props:
 *   text     — label string
 *   variant  — 'default' | 'cyan' | 'green' | 'purple' | 'orange' | 'red'
 *   color    — override hex (takes precedence over variant)
 *   size     — 'sm' | 'md'
 *   dot      — show a leading status dot
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const VARIANTS = {
    default: '#888888',
    cyan: '#00d4ff',
    green: '#00cc88',
    purple: '#a855f7',
    orange: '#f97316',
    red: '#ff4444',
    yellow: '#eab308',
};

export function Badge({ text, variant = 'default', color, size = 'md', dot = false }) {
    const { isDark } = useTheme();
    const accent = color || VARIANTS[variant] || VARIANTS.default;
    const S = size === 'sm'
        ? { px: 7, py: 2, r: 8, fs: 9, ls: 0.8 }
        : { px: 10, py: 4, r: 10, fs: 10, ls: 1 };

    return (
        <View style={[styles.badge, {
            backgroundColor: accent + (isDark ? '18' : '12'),
            borderColor: accent + (isDark ? '44' : '30'),
            paddingHorizontal: S.px,
            paddingVertical: S.py,
            borderRadius: S.r,
        }]}>
            {dot && <View style={[styles.dot, { backgroundColor: accent }]} />}
            <Text style={[styles.txt, { color: accent, fontSize: S.fs, letterSpacing: S.ls }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        gap: 5,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    txt: {
        fontWeight: '800',
    },
});

export default Badge;