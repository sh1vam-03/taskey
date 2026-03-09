import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

export default function ChatBubble({ message }) {
    const isUser = message.role === 'user';
    const { theme } = useTheme();

    const markdownStyles = {
        body: {
            color: isUser ? '#000000' : theme.text,
            fontSize: typography.fontSizes.md,
        },
        code_block: {
            backgroundColor: '#000',
            padding: 8,
            borderRadius: 8,
            color: theme.cyan,
        },
        code_inline: {
            backgroundColor: '#000',
            color: theme.cyan,
        },
    };

    return (
        <View style={[
            styles.container,
            isUser ? { backgroundColor: theme.cyan, borderBottomRightRadius: 4 } : { backgroundColor: theme.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
            isUser ? styles.userContainer : styles.assistantContainer
        ]}>
            {isUser ? (
                <Text style={[styles.userText, { color: '#000000' }]}>{message.content}</Text>
            ) : (
                <View style={styles.assistantContent}>
                    <Markdown style={markdownStyles}>
                        {message.content + (message.isStreaming ? ' \u2588' : '')}
                    </Markdown>
                    {message.model && <Text style={[styles.modelText, { color: theme.textDim }]}>{message.model}</Text>}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 12,
        marginVertical: 6,
    },
    userContainer: {
        alignSelf: 'flex-end',
    },
    assistantContainer: {
        alignSelf: 'flex-start',
    },
    userText: {
        fontSize: typography.fontSizes.md,
    },
    assistantContent: {},
    modelText: {
        fontSize: typography.fontSizes.xs,
        marginTop: 8,
        alignSelf: 'flex-end',
    },
});
