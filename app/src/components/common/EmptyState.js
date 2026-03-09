/**
 * EmptyState -- TASKTIME
 * Premium glass empty state with ambient glow + animated icon.
 *
 * Props:
 *   title       — main heading
 *   description — sub-text
 *   icon        — MCI icon name (string) or custom element
 *   iconColor   — override icon color (defaults to cyan)
 *   action      — { label, onPress } for optional CTA button
 */

import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated,
    TouchableOpacity, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

export function EmptyState({ title, description, icon, iconColor, action }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const iColor = iconColor || cyan;
    const pulse = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return (
        <View style={styles.container}>
            {/* Glass icon well */}
            <View style={[styles.iconWell, {
                backgroundColor: glassBg,
                borderColor: glassBord,
                ...Platform.select({
                    ios: {
                        shadowColor: iColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.20,
                        shadowRadius: 18,
                    },
                }),
            }]}>
                {/* Ambient glow blob */}
                <Animated.View style={[
                    styles.glowBlob,
                    { backgroundColor: iColor, opacity: pulse },
                ]} />

                {typeof icon === 'string'
                    ? <Icon name={icon} size={32} color={iColor} style={{ zIndex: 1 }} />
                    : icon}
            </View>

            <Text style={[styles.title, { color: theme.text ?? '#fff' }]}>
                {title}
            </Text>

            {description ? (
                <Text style={[styles.desc, {
                    color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.40)',
                }]}>
                    {description}
                </Text>
            ) : null}

            {action ? (
                <TouchableOpacity
                    onPress={action.onPress}
                    activeOpacity={0.80}
                    style={[styles.actionBtn, {
                        backgroundColor: iColor + '18',
                        borderColor: iColor + '44',
                    }]}
                >
                    <Text style={[styles.actionTxt, { color: iColor }]}>
                        {action.label}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    iconWell: {
        width: 80,
        height: 80,
        borderRadius: 26,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 4,
    },
    glowBlob: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        top: -16,
        opacity: 0.08,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    desc: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
    },
    actionBtn: {
        marginTop: 8,
        paddingHorizontal: 22,
        paddingVertical: 11,
        borderRadius: 14,
        borderWidth: 1,
    },
    actionTxt: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default EmptyState;