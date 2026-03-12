/**
 * Loader -- TASKTIME
 * Premium glass loader. Spinning arc + pulsing glow for full-screen,
 * small cyan spinner for inline use.
 *
 * Props:
 *   fullScreen — fills entire screen with glass bg + large spinner
 *   text       — optional label below spinner (fullScreen only)
 *   color      — override spinner color
 */

import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    Easing, Platform,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const AnimatedG = Animated.createAnimatedComponent(G);

function SpinArc({ size = 40, color, strokeWidth = 3 }) {
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 900,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const r = (size - strokeWidth) / 2;
    const circ = r * 2 * Math.PI;

    return (
        <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
            <Svg width={size} height={size}>
                {/* track */}
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color + '22'}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* arc — 70% of circumference */}
                <Circle
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${circ * 0.70} ${circ * 0.30}`}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={size / 2}
                    originY={size / 2}
                />
            </Svg>
        </Animated.View>
    );
}

export default function Loader({ fullScreen = false, text, color }) {
    const { theme, isDark } = useTheme();
    const cyan = color || theme.cyan || '#00d4ff';
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (!fullScreen) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.12, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.40, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    /* ── inline ── */
    if (!fullScreen) {
        return <SpinArc size={24} color={cyan} strokeWidth={2.5} />;
    }

    /* ── full-screen ── */
    const glassBg = isDark ? 'rgba(8,8,12,0.96)' : 'rgba(252,252,255,0.96)';
    const glassBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

    return (
        <View style={[styles.fullScreen, { backgroundColor: theme.bg ?? '#080810' }]}>
            {/* Glass card */}
            <View style={[styles.glassCard, {
                backgroundColor: glassBg,
                borderColor: glassBord,
                ...Platform.select({
                    ios: {
                        shadowColor: cyan,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.18,
                        shadowRadius: 30,
                    },
                    android: { elevation: 8 },
                }),
            }]}>
                {/* Glow blob behind arc */}
                <Animated.View style={[styles.glowBlob, {
                    backgroundColor: cyan,
                    opacity: pulseAnim,
                }]} />

                <SpinArc size={52} color={cyan} strokeWidth={3.5} />

                {text ? (
                    <Text style={[styles.loadingTxt, {
                        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
                    }]}>
                        {text.toUpperCase()}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glassCard: {
        width: 100,
        height: 100,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        gap: 12,
    },
    glowBlob: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        top: -44,
    },
    loadingTxt: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2.5,
        textAlign: 'center',
        marginTop: -4,
    },
});