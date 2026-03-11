/**
 * _authShared.js  —  TASKTIME Auth Design System
 *
 * Design principle: Typography-first minimal dark.
 * No decorations, no illustrations. Every element earns its place.
 * Inspired by Linear, Vercel, Clerk auth flows.
 */
import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    TextInput, TouchableOpacity, Platform,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';

/* ─── Tokens ────────────────────────────────────────────────────────────── */
export const C = {
    /* Surfaces */
    bg: '#0a0a0c',
    surface: '#111116',
    /* Borders */
    border: 'rgba(255,255,255,0.08)',
    borderHi: 'rgba(255,255,255,0.14)',
    focus: '#00d4ff',
    /* Text */
    text: '#f1f1f3',
    sub: 'rgba(255,255,255,0.48)',
    muted: 'rgba(255,255,255,0.28)',
    /* Accent */
    cyan: '#00d4ff',
    cyanFaint: 'rgba(0,212,255,0.08)',
    cyanTrim: 'rgba(0,212,255,0.22)',
    /* States */
    error: '#f87171',
    success: '#34d399',
    /* Utility */
    dim6: 'rgba(255,255,255,0.06)',
    dim10: 'rgba(255,255,255,0.10)',
};

export const RADIUS = { sm: 10, md: 14, lg: 20 };
export const FONT = {
    display: { fontWeight: '800', letterSpacing: -0.6 },
    heading: { fontWeight: '700', letterSpacing: -0.3 },
    label: { fontWeight: '600', letterSpacing: 0.2 },
    body: { fontWeight: '400' },
};


/* ─── Background ────────────────────────────────────────────────────────── */
/* A single, very subtle top-edge ambient glow — nothing more */
export function AuthBg() {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 7000, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 7000, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.85] });
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[bgS.topGlow, { opacity }]} />
        </View>
    );
}


/* ─── Logo / Auth Header ────────────────────────────────────────────────── */
export function AuthHeader() {
    return (
        <View style={logoS.row}>
            <Svg height={45} width={300} style={{ marginBottom: 12 }}>
                <Defs>
                    <LinearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                        <Stop offset="0.5" stopColor="#e0e0e0" stopOpacity="1" />
                        <Stop offset="1" stopColor="#888888" stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <SvgText
                    fill="url(#loginGrad)"
                    fontSize="36"
                    fontWeight="900"
                    x="150"
                    y="36"
                    textAnchor="middle"
                    letterSpacing="8"
                >
                    TASKTIME
                </SvgText>
            </Svg>
        </View>
    );
}


/* ─── Input ─────────────────────────────────────────────────────────────── */
export function Input({
    label, placeholder, value, onChangeText,
    secure, keyboard, capitalize,
    iconLeft, iconRight, onIconRight,
    autoFocus, returnKey, onSubmit,
}) {
    const focused = useRef(new Animated.Value(0)).current;

    const animate = (to) =>
        Animated.timing(focused, { toValue: to, duration: 160, useNativeDriver: false }).start();

    const borderColor = focused.interpolate({
        inputRange: [0, 1],
        outputRange: [C.border, C.focus],
    });

    return (
        <View style={inS.wrap}>
            {label ? <Text style={inS.label}>{label}</Text> : null}
            <Animated.View style={[inS.field, { borderColor }]}>
                {iconLeft ? (
                    <Icon name={iconLeft} size={15} color={C.muted} style={inS.icoLeft} />
                ) : null}
                <TextInput
                    style={[inS.text, !iconLeft && { paddingLeft: 16 }]}
                    placeholder={placeholder}
                    placeholderTextColor={C.muted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secure}
                    keyboardType={keyboard || 'default'}
                    autoCapitalize={capitalize || 'sentences'}
                    autoFocus={autoFocus}
                    returnKeyType={returnKey || 'done'}
                    onSubmitEditing={onSubmit}
                    onFocus={() => animate(1)}
                    onBlur={() => animate(0)}
                    selectionColor={C.focus}
                    textAlignVertical="center"
                    blurOnSubmit={false}
                />
                {iconRight ? (
                    <TouchableOpacity
                        onPress={onIconRight}
                        style={inS.icoRight}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Icon name={iconRight} size={15} color={C.muted} />
                    </TouchableOpacity>
                ) : null}
            </Animated.View>
        </View>
    );
}


/* ─── Primary button ────────────────────────────────────────────────────── */
export function Btn({ label, onPress, loading, disabled }) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        if (loading || disabled) return;
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.976, duration: 65, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => onPress?.());
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                style={[btnS.primary, (loading || disabled) && btnS.disabled, { overflow: 'hidden' }]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Top highlight (shimmer) */}
                <View style={{ position: 'absolute', top: 0, left: '10%', width: '35%', height: 1, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 1, opacity: 0.8 }} pointerEvents="none" />
                {/* Bottom inner shadow */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: 'rgba(0,0,0,0.15)' }} pointerEvents="none" />

                <Text style={btnS.primaryTxt}>{loading ? 'Please wait…' : label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}


/* ─── Ghost button ───────────────────────────────────────────────────────── */
export function GhostBtn({ label, onPress }) {
    return (
        <TouchableOpacity style={btnS.ghost} onPress={onPress} activeOpacity={0.7}>
            <Text style={btnS.ghostTxt}>{label}</Text>
        </TouchableOpacity>
    );
}


/* ─── Back arrow ─────────────────────────────────────────────────────────── */
export function BackArrow({ onPress }) {
    return (
        <TouchableOpacity
            style={navS.back}
            onPress={onPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
            <Icon name="arrow-left" size={20} color={C.sub} />
        </TouchableOpacity>
    );
}


/* ─── Inline error ───────────────────────────────────────────────────────── */
export function ErrMsg({ msg }) {
    if (!msg) return null;
    return (
        <View style={msgS.errWrap}>
            <Icon name="alert-circle" size={13} color={C.error} style={{ marginRight: 7, flexShrink: 0 }} />
            <Text style={[msgS.txt, { color: C.error }]}>{msg}</Text>
        </View>
    );
}


/* ─── Inline success ─────────────────────────────────────────────────────── */
export function OkMsg({ msg }) {
    if (!msg) return null;
    return (
        <View style={msgS.okWrap}>
            <Icon name="check-circle" size={13} color={C.success} style={{ marginRight: 7, flexShrink: 0 }} />
            <Text style={[msgS.txt, { color: C.success }]}>{msg}</Text>
        </View>
    );
}


/* ─── Rule with label ────────────────────────────────────────────────────── */
export function Divider({ label = 'or' }) {
    return (
        <View style={divS.row}>
            <View style={[divS.line, { backgroundColor: C.border }]} />
            <Text style={divS.txt}>{label}</Text>
            <View style={[divS.line, { backgroundColor: C.border }]} />
        </View>
    );
}


/* ─── Inline footer link ─────────────────────────────────────────────────── */
export function FooterLink({ plain, accent, onPress }) {
    return (
        <View style={footS.row}>
            <Text style={footS.plain}>{plain} </Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={footS.accent}>{accent}</Text>
            </TouchableOpacity>
        </View>
    );
}


/* ═══════════════════════════ Styles ═══════════════════════════════════════ */
const bgS = StyleSheet.create({
    topGlow: {
        position: 'absolute',
        width: 500, height: 500,
        borderRadius: 250,
        top: -280, alignSelf: 'center',
        backgroundColor: 'rgba(0,212,255,0.045)',
    },
});

const logoS = StyleSheet.create({
    row: { alignItems: 'center', paddingTop: 60, marginBottom: 4 },
});

const inS = StyleSheet.create({
    wrap: { marginBottom: 12 },
    label: {
        fontSize: 11, fontWeight: '600',
        color: C.muted, marginBottom: 7,
        letterSpacing: 0.5, textTransform: 'uppercase',
    },
    field: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.dim6,
        borderWidth: 1, borderRadius: RADIUS.md,
        minHeight: 52,
    },
    icoLeft: { marginLeft: 15 },
    icoRight: { paddingHorizontal: 15 },
    text: {
        flex: 1, height: 52,
        fontSize: 15, color: C.text,
        fontWeight: '400',
        paddingHorizontal: 12,
        includeFontPadding: false,
    },
});

const btnS = StyleSheet.create({
    primary: {
        height: 54, borderRadius: 18,
        backgroundColor: C.cyan,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 6,
        ...Platform.select({
            ios: {
                shadowColor: C.cyan,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45,
                shadowRadius: 18,
            },
            android: { elevation: 10 },
        }),
    },
    primaryTxt: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.6 },
    disabled: { opacity: 0.55 },
    ghost: {
        height: 54, borderRadius: 18,
        borderWidth: 1, borderColor: C.border,
        alignItems: 'center', justifyContent: 'center',
        marginTop: 10,
    },
    ghostTxt: { fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: 0.2 },
});

const navS = StyleSheet.create({
    back: { marginBottom: 28, alignSelf: 'flex-start', padding: 2 },
});

const msgS = StyleSheet.create({
    errWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(248,113,113,0.07)',
        borderWidth: 1, borderColor: 'rgba(248,113,113,0.20)',
        borderRadius: RADIUS.sm,
        paddingHorizontal: 12, paddingVertical: 10,
        marginBottom: 14,
    },
    okWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(52,211,153,0.07)',
        borderWidth: 1, borderColor: 'rgba(52,211,153,0.20)',
        borderRadius: RADIUS.sm,
        paddingHorizontal: 12, paddingVertical: 10,
        marginBottom: 14,
    },
    txt: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});

const divS = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
    line: { flex: 1, height: 1 },
    txt: { fontSize: 12, color: C.muted, fontWeight: '500', paddingHorizontal: 14 },
});

const footS = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    plain: { fontSize: 14, color: C.muted },
    accent: { fontSize: 14, color: C.cyan, fontWeight: '600' },
});
