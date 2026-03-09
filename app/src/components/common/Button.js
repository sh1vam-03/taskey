/**
 * Button -- TASKTIME
 * Premium glass button. Same visual language as AppHeader + CustomTabBar.
 *
 * Variants:  primary | outline | ghost | danger | subtle
 * Sizes:     sm | md | lg
 */

import React, { useRef } from 'react';
import {
    TouchableOpacity, Text, StyleSheet,
    ActivityIndicator, View, Animated, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,                   // MaterialCommunityIcons name
    iconRight = false,
    style,
    textStyle,
}) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const scale = useRef(new Animated.Value(1)).current;

    /* ── press animation ── */
    const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

    /* ── variant tokens ── */
    const V = {
        primary: {
            bg: cyan,
            border: 'transparent',
            text: '#000',
            iconColor: '#000',
            shadow: cyan,
            shimmer: 'rgba(255,255,255,0.25)',
        },
        outline: {
            bg: isDark ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.06)',
            border: cyan + '55',
            text: cyan,
            iconColor: cyan,
            shadow: cyan,
            shimmer: null,
        },
        ghost: {
            bg: 'transparent',
            border: 'transparent',
            text: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
            iconColor: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
            shadow: null,
            shimmer: null,
        },
        danger: {
            bg: isDark ? 'rgba(255,68,68,0.10)' : 'rgba(255,68,68,0.08)',
            border: 'rgba(255,68,68,0.40)',
            text: '#ff4444',
            iconColor: '#ff4444',
            shadow: '#ff4444',
            shimmer: null,
        },
        subtle: {
            bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)',
            text: theme.text ?? '#fff',
            iconColor: theme.text ?? '#fff',
            shadow: null,
            shimmer: null,
        },
    }[variant] || {};

    /* ── size tokens ── */
    const S = {
        sm: { height: 36, px: 16, fontSize: 11, iconSize: 14, radius: 12, gap: 6 },
        md: { height: 48, px: 22, fontSize: 13, iconSize: 16, radius: 16, gap: 8 },
        lg: { height: 56, px: 28, fontSize: 15, iconSize: 18, radius: 20, gap: 9 },
    }[size] || {};

    const isDisabled = disabled || loading;

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.85}
                disabled={isDisabled}
                style={[
                    styles.base,
                    {
                        height: S.height,
                        paddingHorizontal: S.px,
                        borderRadius: S.radius,
                        backgroundColor: V.bg,
                        borderColor: V.border,
                        borderWidth: V.border === 'transparent' ? 0 : 1,
                        opacity: isDisabled ? 0.45 : 1,
                        gap: S.gap,
                        ...(V.shadow && !isDisabled ? Platform.select({
                            ios: {
                                shadowColor: V.shadow,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: variant === 'primary' ? 0.35 : 0.20,
                                shadowRadius: 10,
                            },
                            android: { elevation: variant === 'primary' ? 6 : 3 },
                        }) : {}),
                    },
                ]}
            >
                {/* Shimmer line for primary */}
                {V.shimmer && (
                    <View style={[styles.shimmerLine, { backgroundColor: V.shimmer }]} pointerEvents="none" />
                )}

                {/* Left icon */}
                {icon && !iconRight && !loading && (
                    <Icon name={icon} size={S.iconSize} color={V.iconColor} />
                )}

                {/* Label */}
                {loading ? (
                    <ActivityIndicator size="small" color={V.text} />
                ) : (
                    <Text style={[
                        styles.label,
                        {
                            fontSize: S.fontSize,
                            color: V.text,
                            fontWeight: variant === 'primary' ? '900' : '700',
                            letterSpacing: variant === 'primary' ? 0.5 : 0.3,
                        },
                        textStyle,
                    ]}>
                        {title}
                    </Text>
                )}

                {/* Right icon */}
                {icon && iconRight && !loading && (
                    <Icon name={icon} size={S.iconSize} color={V.iconColor} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    shimmerLine: {
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '35%',
        height: 1,
        borderRadius: 1,
        opacity: 0.60,
    },
    label: {
        textAlign: 'center',
    },
});