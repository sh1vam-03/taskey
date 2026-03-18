/**
 * AiScreen.js
 *
 * AI assistant overview screen. Design matches IntroScreen for consistency.
 */
import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    Linking, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { AuthBg, Btn, C } from '../auth/_authShared';

const { width: W } = Dimensions.get('window');
const WEB_URL = 'https://tasktime-sh1vam-03.vercel.app/dashboard/ai';

export default function AiScreen() {
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

    const rise = (i, dy = 16) => ({
        opacity: layers[i],
        transform: [{
            translateY: layers[i].interpolate({
                inputRange: [0, 1], outputRange: [dy, 0],
            }),
        }],
    });

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <AuthBg />

            <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

                {/* ── Main content — centered ── */}
                <View style={s.body}>

                    {/* Headline block */}
                    <Animated.View style={[s.headlineBlock, rise(1)]}>
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
                        <Text style={s.headline}>
                            Meet Your Personal AI.{'\n'}Smarter Planning Awaits.
                        </Text>
                    </Animated.View>

                    {/* Description Text */}
                    <Animated.View style={[s.descriptionBlock, rise(2, 14)]}>
                        <Text style={s.tagline}>
                            Access the full power of our multi-model AI assistant.
                            Automate task creation, prioritize your day, and get smart
                            insights to stay ahead of your schedule.
                        </Text>
                    </Animated.View>

                </View>

                {/* ── CTA pinned to bottom ── */}
                <Animated.View style={[s.ctaBlock, rise(3, 12)]}>
                    <Btn
                        label="Visit Website to Access AI"
                        onPress={() => Linking.openURL(WEB_URL)}
                    />
                    <View style={s.legalRow}>
                        <Text style={s.legalTxt}>
                            Currently optimized for web at{' '}
                        </Text>
                        <Text
                            style={s.legalLink}
                            onPress={() => Linking.openURL(WEB_URL)}
                        >
                            tasktime-sh1vam-03.vercel.app
                        </Text>
                    </View>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    safe: { flex: 1, paddingHorizontal: 26 },

    body: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headlineBlock: { marginBottom: 32, alignItems: 'center', width: '100%' },
    headline: {
        fontSize: 20,
        fontWeight: '400',
        color: C.text,
        letterSpacing: -0.5,
        lineHeight: 32,
        marginBottom: 16,
        textAlign: 'center',
    },

    descriptionBlock: { paddingHorizontal: 20, width: '100%', alignItems: 'center' },
    tagline: {
        fontSize: 15,
        fontWeight: '400',
        color: C.sub,
        lineHeight: 24,
        textAlign: 'center',
    },

    ctaBlock: { paddingBottom: 96 }, // Increased padding to clear CustomTabBar (62px + insets)
    legalRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 18,
    },
    legalTxt: {
        fontSize: 11,
        color: C.muted,
        lineHeight: 18,
    },
    legalLink: {
        fontSize: 11,
        color: C.cyan,
        fontWeight: '500',
        lineHeight: 18,
    },
});
