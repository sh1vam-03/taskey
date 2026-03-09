import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';

export default function ConversationItem({ conversation, onPress }) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: theme.cyanDim }]}>
                <Icon name="message-square" size={20} color={theme.cyan} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {conversation.title || 'New Conversation'}
                </Text>
                <Text style={[styles.date, { color: theme.textDim }]}>
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                </Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textDim} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    date: { fontSize: 12 },
});
