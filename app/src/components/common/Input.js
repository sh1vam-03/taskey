/**
 * Input -- TASKTIME
 * Premium glass text input. Cyan focus ring, icon support, error state.
 */

import React, { useRef, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Animated, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

export default function Input({
    label,
    error,
    hint,
    leftIcon,         // MCI icon name string OR element
    rightIcon,        // MCI icon name string OR element
    onRightIconPress,
    style,
    containerStyle,
    labelStyle,
    ...props
}) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const [focused, setFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const onFocus = (e) => {
        setFocused(true);
        Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
        props.onFocus?.(e);
    };
    const onBlur = (e) => {
        setFocused(false);
        Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
        props.onBlur?.(e);
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error
                ? '#ff444466'
                : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'),
            error ? '#ff4444aa' : cyan + '88',
        ],
    });

    /* glass bg */
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

    const renderSideIcon = (iconProp, right = false) => {
        if (!iconProp) return null;
        const el = typeof iconProp === 'string'
            ? <Icon name={iconProp} size={18}
                color={focused ? cyan : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)')} />
            : iconProp;
        if (right && onRightIconPress) {
            return (
                <TouchableOpacity onPress={onRightIconPress} style={[styles.sideIcon, styles.rightIcon]}>
                    {el}
                </TouchableOpacity>
            );
        }
        return (
            <View style={[styles.sideIcon, right ? styles.rightIcon : styles.leftIcon]}>
                {el}
            </View>
        );
    };

    return (
        <View style={[styles.wrap, containerStyle]}>
            {/* Label */}
            {label ? (
                <Text style={[
                    styles.label,
                    {
                        color: focused
                            ? cyan
                            : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                    },
                    labelStyle,
                ]}>
                    {label.toUpperCase()}
                </Text>
            ) : null}

            {/* Input row */}
            <Animated.View style={[
                styles.inputRow,
                {
                    backgroundColor: inputBg,
                    borderColor: borderColor,
                    minHeight: props.multiline ? (props.numberOfLines ? props.numberOfLines * 24 + 20 : 80) : 52,
                    height: props.multiline ? undefined : 52,
                    alignItems: props.multiline ? 'flex-start' : 'center',
                    ...Platform.select({
                        ios: focused ? {
                            shadowColor: error ? '#ff4444' : cyan,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.22,
                            shadowRadius: 8,
                        } : {},
                        android: {},
                    }),
                },
            ]}>
                {renderSideIcon(leftIcon)}

                <TextInput
                    {...props}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'}
                    textAlignVertical={props.multiline ? 'top' : 'center'}
                    style={[
                        styles.input,
                        {
                            color: theme.text ?? '#fff',
                            paddingLeft: leftIcon ? 0 : 16,
                            paddingRight: rightIcon ? 0 : 16,
                            paddingTop: props.multiline ? 12 : 0,
                            paddingBottom: props.multiline ? 12 : 0,
                        },
                        style,
                    ]}
                />

                {renderSideIcon(rightIcon, true)}
            </Animated.View>

            {/* Error / hint */}
            {error ? (
                <View style={styles.errorRow}>
                    <Icon name="alert-circle-outline" size={12} color="#ff4444" />
                    <Text style={styles.errorTxt}>{error}</Text>
                </View>
            ) : hint ? (
                <Text style={[styles.hint, { color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.30)' }]}>
                    {hint}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginBottom: 18 },
    label: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        height: 52,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        fontWeight: '500',
    },
    sideIcon: { justifyContent: 'center', alignItems: 'center', height: '100%', paddingHorizontal: 14 },
    leftIcon: {},
    rightIcon: {},
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 5,
    },
    errorTxt: { color: '#ff4444', fontSize: 11, fontWeight: '600' },
    hint: { fontSize: 11, fontWeight: '500', marginTop: 6 },
});