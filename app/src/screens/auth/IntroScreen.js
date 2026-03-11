/**
 * IntroScreen.js
 *
 * Clean, minimal onboarding. Strong headline. Honest product description.
 * No fake stats, no illustrations. Typography does the work.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';
import { AuthBg, Btn, C, RADIUS } from './_authShared';


const { width: W } = Dimensions.get('window');

export default function IntroScreen({ navigation }) {
    /* Staggered entrance — 4 layers */
    const layers = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

    useEffect(() => {
        layers.forEach((a, i) => {
            Animated.timing(a, {
                toValue: 1,
                duration: 500,
                delay: 80 + i * 100,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    const fade = (i) => ({ opacity: layers[i] });
    const rise = (i, dy = 16) => ({
        opacity: layers[i],
        transform: [{ translateY: layers[i].interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }],
    });

    return (
        <View style={s.root}>
            <AuthBg />

            <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

                {/* ── Main content — fills remaining space ── */}
                <View style={[s.body, { justifyContent: 'center', alignItems: 'center' }]}>

                    {/* Headline block */}
                    <Animated.View style={[s.headlineBlock, rise(1), { alignItems: 'center', width: '100%' }]}>
                        <Svg height={65} width={W - 52} style={{ marginBottom: 24 }}>
                            <Defs>
                                <LinearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                                    <Stop offset="0.5" stopColor="#e0e0e0" stopOpacity="1" />
                                    <Stop offset="1" stopColor="#888888" stopOpacity="1" />
                                </LinearGradient>
                            </Defs>
                            <SvgText
                                fill="url(#heroGrad)"
                                fontSize="52"
                                fontWeight="900"
                                x={(W - 52) / 2 + 6}
                                y="52"
                                textAnchor="middle"
                                letterSpacing="12"
                            >
                                TASKTIME
                            </SvgText>
                        </Svg>
                        <Text style={[s.headline, { textAlign: 'center' }]}>
                            Plan Smarter. Work Faster.{'\n'}Powered by AI.
                        </Text>
                    </Animated.View>

                    {/* Tagline / Subtitle */}
                    <Animated.View style={[s.featureList, rise(2, 14), { paddingHorizontal: 20, width: '100%', alignItems: 'center' }]}>
                        <Text style={[s.tagline, { textAlign: 'center' }]}>
                            TASKTIME helps you organize tasks, automate schedules, and stay focused every day with intelligent planning.
                        </Text>
                    </Animated.View>

                </View>

                {/* ── CTAs pinned to bottom ── */}
                <Animated.View style={[s.ctaBlock, rise(3, 12)]}>
                    <Btn
                        label="Get Started"
                        onPress={() => navigation.navigate('Login')}
                    />
                    <Text style={s.legal}>
                        By continuing you agree to our{' '}
                        <Text style={s.legalLink} onPress={() => Linking.openURL('https://tasktime-sh1vam-03.vercel.app/terms')}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={s.legalLink} onPress={() => Linking.openURL('https://tasktime-sh1vam-03.vercel.app/privacy')}>Privacy Policy</Text>.
                    </Text>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    safe: { flex: 1, paddingHorizontal: 26 },

    logoRow: { paddingTop: 18, marginBottom: 0 },

    body: { flex: 1, justifyContent: 'center' },

    headlineBlock: { marginBottom: 32 },
    headline: {
        fontSize: 20,
        fontWeight: '400',
        color: C.text,
        letterSpacing: -0.5,
        lineHeight: 32,
        marginBottom: 16,
    },
    tagline: {
        fontSize: 15,
        fontWeight: '400',
        color: C.sub,
        lineHeight: 24,
    },

    featureList: { gap: 13 },
    point: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    dot: {
        width: 5, height: 5, borderRadius: 3,
        backgroundColor: C.cyan,
        marginTop: 8, flexShrink: 0,
    },
    pointTxt: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: C.sub,
        lineHeight: 22,
    },

    ctaBlock: { paddingBottom: 8 },
    legal: {
        textAlign: 'center',
        fontSize: 11,
        color: C.muted,
        lineHeight: 18,
        marginTop: 18,
    },
    legalLink: {
        color: C.cyan,
        fontWeight: '500',
    },
});
