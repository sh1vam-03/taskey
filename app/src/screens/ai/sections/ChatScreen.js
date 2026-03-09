import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { useStream } from '../../../hooks/useStream';
import { getMessages, createConversation } from '../../../api/ai.api';

export default function ChatScreen({ route, navigation }) {
    const { conversationId: initialId } = route.params || {};
    const [conversationId, setConversationId] = useState(initialId);
    const [input, setInput] = useState('');
    const { messages, isStreaming, streamMessage, initializeMessages } = useStream();
    const [loading, setLoading] = useState(!!initialId);
    const flatListRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (initialId) {
            fetchMessages(initialId);
        }
    }, [initialId]);

    const fetchMessages = async (id) => {
        try {
            const { data } = await getMessages(id);
            initializeMessages(data.data || data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const prompt = input;
        setInput('');

        let currentId = conversationId;
        if (!currentId) {
            try {
                const { data } = await createConversation('CHAT');
                currentId = data.data?._id || data._id;
                setConversationId(currentId);
            } catch (err) {
                console.error('Failed to create conversation', err);
                return;
            }
        }

        streamMessage(currentId, prompt, 'smart'); // Default to smart model
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? { backgroundColor: theme.cyan, borderBottomRightRadius: 4 } : { backgroundColor: theme.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
                isUser ? styles.userBubble : styles.aiBubble
            ]}>
                {!isUser && <Icon name="cpu" size={14} color={theme.cyan} style={styles.botIcon} />}
                <Text style={[styles.messageText, { color: isUser ? '#000' : theme.text }]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Icon name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>AI Personal Assistant</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={[styles.statusText, { color: theme.textDim }]}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <Icon name="more-vertical" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={theme.cyan} size="large" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Icon name="paperclip" size={20} color={theme.textDim} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bg, color: theme.text }]}
                        placeholder="Ask me anything..."
                        placeholderTextColor={theme.textDim}
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: theme.cyan }, !input.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim() || isStreaming}
                    >
                        {isStreaming ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Icon name="send" size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    headerBtn: { padding: 12 },
    headerContent: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 },
    statusText: { fontSize: 12 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageList: { padding: 16, paddingBottom: 32 },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
    },
    aiBubble: {
        alignSelf: 'flex-start',
    },
    botIcon: { marginBottom: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
    },
    attachBtn: { padding: 10 },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        marginHorizontal: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        opacity: 0.5,
    }
});
