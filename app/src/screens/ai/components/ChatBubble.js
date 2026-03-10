import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../../context/ThemeContext';

export default function ChatBubble({ message }) {
    const isUser = message?.role === 'user';
    const { theme, isDark } = useTheme();
    const cyan = theme.cyan ?? '#00d4ff';

    // Null guard — don't crash on undefined content
    const content = message?.content ?? '';

    const markdownStyles = {
        body: {
            color: isUser ? '#000000' : theme.text,
            fontSize: 15,
            fontWeight: isUser ? '700' : '400',
            lineHeight: 22,
        },
        code_block: {
            backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.07)',
            padding: 12,
            borderRadius: 12,
            color: cyan,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        },
        code_inline: {
            backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.07)',
            color: cyan,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 5,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
        },
        fence: {
            backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.07)',
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        },
        heading1: { color: theme.text, fontWeight: '900', fontSize: 18 },
        heading2: { color: theme.text, fontWeight: '800', fontSize: 16 },
        heading3: { color: theme.text, fontWeight: '700', fontSize: 15 },
        strong:   { fontWeight: '700', color: isUser ? '#000000' : theme.text },
        em:       { fontStyle: 'italic' },
        bullet_list: { marginVertical: 4 },
        list_item:   { marginVertical: 2 },
        blockquote: {
            borderLeftWidth: 3,
            borderLeftColor: cyan,
            paddingLeft: 12,
            marginVertical: 8,
            opacity: 0.8,
        },
        link: { color: cyan, textDecorationLine: 'underline' },
    };

    return (
        <View style={[
            styles.container,
            isUser
                ? { backgroundColor: cyan, borderBottomRightRadius: 5, alignSelf: 'flex-end' }
                : {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderBottomLeftRadius: 5,
                    alignSelf: 'flex-start',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
                  },
        ]}>
            {isUser ? (
                <Text style={[styles.userText, { color: '#000000' }]}>{content}</Text>
            ) : (
                <View>
                    <Markdown style={markdownStyles}>
                        {content + (message?.isStreaming ? ' \u2588' : '')}
                    </Markdown>
                    {message?.model && (
                        <Text style={[styles.modelLabel, {
                            color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)',
                        }]}>
                            {message.model}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

import { Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        maxWidth: '85%',
        padding: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginVertical: 6,
    },
    userText: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 22,
    },
    modelLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 8,
        alignSelf: 'flex-end',
    },
});
