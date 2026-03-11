/**
 * ResetPasswordScreen.js
 * Redesigned informational screen to match Auth theme.
 */
import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {
    AuthBg, AuthHeader, Btn, BackArrow,
    C, RADIUS, FONT
} from './_authShared';

export default function ResetPasswordScreen({ route, navigation }) {
    const email = route.params?.email || 'your email';

    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true
        }).start();
    }, []);

    const style = {
        opacity: anim,
        transform: [{
            translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
            })
        }],
    };

    return (
        <View style={s.root}>
            <AuthBg />
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <AuthHeader />
                <ScrollView
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={style}>
                        <BackArrow onPress={() => navigation.goBack()} />

                        <View style={s.centerCard}>
                            <View style={s.iconWrap}>
                                <Icon name="mail" size={38} color={C.cyan} />
                            </View>

                            <View style={s.header}>
                                <Text style={s.title}>Check your email</Text>
                                <Text style={s.sub}>
                                    We've sent a password reset link to{' '}
                                    <Text style={s.accentText}>{email}</Text>
                                </Text>
                            </View>

                            <View style={s.infoBox}>
                                <Icon name="info" size={14} color={C.sub} style={s.infoIcon} />
                                <Text style={s.infoText}>
                                    Tap the link in your email to create a new password. It will open securely in your web browser.
                                </Text>
                            </View>

                            <View style={s.btnWrap}>
                                <Btn
                                    label="Back to login"
                                    onPress={() => navigation.navigate('Login')}
                                />
                            </View>

                            <Text style={s.footerTxt}>
                                Didn't get it? Check your spam or try again.
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flexGrow: 1, paddingHorizontal: 26, justifyContent: 'center' },
    centerCard: { alignItems: 'center', width: '100%' },
    iconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: C.cyanFaint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: C.cyanTrim,
    },
    header: { marginBottom: 32, alignItems: 'center' },
    title: {
        ...FONT.display,
        fontSize: 28,
        color: C.text,
        marginBottom: 10,
        textAlign: 'center'
    },
    sub: {
        fontSize: 16,
        color: C.sub,
        lineHeight: 24,
        textAlign: 'center'
    },
    accentText: { color: C.text, fontWeight: '700' },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: C.dim6,
        padding: 18,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 28,
        width: '100%',
    },
    infoIcon: { marginRight: 12, marginTop: 2 },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: C.sub,
        lineHeight: 18,
        fontWeight: '500'
    },
    btnWrap: { width: '100%' },
    footerTxt: {
        marginTop: 28,
        fontSize: 13,
        color: C.muted,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500'
    }
});
