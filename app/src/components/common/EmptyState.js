/**
 * EmptyState -- TASKTIME
 * Premium glass empty state with pulse animation.
 * Ported directly from TasksScreen redesign.
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
    const iColor = iconColor || (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.13)');
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.07, duration: 1800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

    return (
        <View style={styles.emptyWrap}>
            <Animated.View style={[styles.emptyIcon, {
                backgroundColor: glassBg,
                borderColor: glassBord,
                transform: [{ scale: pulse }],
                ...Platform.select({
                    ios: {
                        shadowColor: cyan,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 18,
                    },
                }),
            }]}>
                <Icon name={icon} size={36} color={iColor} />
            </Animated.View>

            <Text style={[styles.emptyTitle, { color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.48)' }]}>
                {title}
            </Text>

            <Text style={[styles.emptySub, { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.26)' }]}>
                {description}
            </Text>

            {action && (
                <TouchableOpacity
                    onPress={action.onPress}
                    activeOpacity={0.82}
                    style={[styles.emptyBtn, {
                        backgroundColor: cyan + '18',
                        borderColor: cyan + '44',
                        ...Platform.select({
                            ios: {
                                shadowColor: cyan,
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.20,
                                shadowRadius: 12,
                            }
                        }),
                    }]}
                >
                    <Icon name="plus" size={13} color={cyan} style={{ marginRight: 6 }} />
                    <Text style={[styles.emptyBtnTxt, { color: cyan }]}>{action.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: 56,
    },
    emptyIcon: {
        width: 82,
        height: 82,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySub: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 22,
    },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 18,
    },
    emptyBtnTxt: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
});

export default EmptyState;