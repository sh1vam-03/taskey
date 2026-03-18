import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native'; // ✅ Platform was missing
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

export default function ConversationItem({ conversation, onPress, isActive }) {
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    const glassBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: isActive ? cyan + '1A' : glassBg,
                    borderColor:     isActive ? cyan + '40' : glassBord,
                },
                Platform.select({
                    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
                    android: { elevation: 2 },
                }),
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Active stripe */}
            <View style={[styles.stripe, { backgroundColor: isActive ? cyan : 'transparent' }]} />

            <View style={styles.inner}>
                <View style={[
                    styles.iconContainer,
                    {
                        backgroundColor: isActive ? cyan + '20' : glassBg,
                        borderColor:     isActive ? cyan + '40' : glassBord,
                        borderWidth: 1,
                    }
                ]}>
                    <Icon name="chat-processing-outline" size={18} color={isActive ? cyan : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
                </View>

                <View style={styles.content}>
                    <Text
                        style={[styles.title, { color: theme.text, fontWeight: '700', letterSpacing: -0.2 }]}
                        numberOfLines={1}
                    >
                        {conversation.title || 'New Conversation'}
                    </Text>
                    <Text style={[styles.date, {
                        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
                        fontWeight: '500',
                    }]}>
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                    </Text>
                </View>

                <Icon
                    name="chevron-right"
                    size={18}
                    color={isActive ? cyan : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    stripe: {
        width: 3,
        alignSelf: 'stretch',
    },
    inner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: { flex: 1 },
    title:  { fontSize: 14, marginBottom: 2 },
    date:   { fontSize: 11 },
});
