/**
 * Card -- TASKTIME
 * Premium glass card. Foundation for every panel in the app.
 * Matches AppHeader / CustomTabBar glass language exactly.
 *
 * Props:
 *   accent       — hex color for top-bar accent (omit for no bar)
 *   title        — optional header text
 *   titleIcon    — MaterialCommunityIcons name shown beside title
 *   onPress      — makes it a TouchableOpacity
 *   noPadding    — removes inner padding (for full-bleed content)
 *   style        — additional style overrides
 */

import React from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

export default function Card({
    children,
    accent,
    title,
    titleIcon,
    onPress,
    noPadding = false,
    style,
}) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const accentCol = accent || null;

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={0.80}
            style={[
                styles.card,
                {
                    backgroundColor: glassBg,
                    borderColor: glassBord,
                    ...(accentCol ? Platform.select({
                        ios: {
                            shadowColor: accentCol,
                            shadowOffset: { width: 0, height: 5 },
                            shadowOpacity: 0.10,
                            shadowRadius: 14,
                        },
                        android: { elevation: 3 },
                    }) : Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.09,
                            shadowRadius: 10,
                        },
                        android: { elevation: 2 },
                    })),
                },
                style,
            ]}
        >
            {/* Coloured top accent bar */}
            {accentCol && (
                <View style={[styles.accentBar, { backgroundColor: accentCol + 'cc' }]} />
            )}

            {/* Optional card header */}
            {title && (
                <View style={[
                    styles.header,
                    {
                        borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        paddingBottom: 12,
                        marginBottom: 14,
                    },
                ]}>
                    {titleIcon && (
                        <View style={[styles.titleIconWrap, {
                            backgroundColor: cyan + (isDark ? '18' : '10'),
                            borderColor: cyan + '30',
                        }]}>
                            <Icon name={titleIcon} size={13} color={cyan} />
                        </View>
                    )}
                    <Text style={[styles.titleText, { color: theme.text ?? '#fff' }]}>
                        {title.toUpperCase()}
                    </Text>
                </View>
            )}

            {/* Content */}
            <View style={noPadding ? styles.noPad : styles.content}>
                {children}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 22,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 12,
    },
    accentBar: {
        height: 2.5,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingHorizontal: 18,
        paddingTop: 16,
    },
    titleIconWrap: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },
    titleText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2.5,
    },
    content: {
        padding: 18,
    },
    noPad: {
        padding: 0,
    },
});