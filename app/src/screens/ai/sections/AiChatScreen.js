import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { getConversations, getMessages, createConversation, getSettings, updateSettings } from '../../../api/ai.api';
import { useStream } from '../../../hooks/useStream';
import ChatBubble from '../../../components/ai/ChatBubble';
import ModelSelector from '../../../components/ai/ModelSelector';
import Card from '../../../components/common/Card';
import Loader from '../../../components/common/Loader';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

export default function AiChatScreen() {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);

    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
    const [isModelSelectorVisible, setIsModelSelectorVisible] = useState(false);
    const [viewState, setViewState] = useState('list'); // 'list' | 'chat'
    const [loading, setLoading] = useState(true);

    const { messages, isStreaming, streamMessage, initializeMessages } = useStream();
    const flatListRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        fetchConversations();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await getSettings();
            const settings = data?.data || data;
            if (settings?.chatModel) {
                setSelectedModel(settings.chatModel);
            }
        } catch (err) {
            console.log('Failed to fetch AI settings', err);
        }
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data } = await getConversations();
            setConversations(data.data || data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (id) => {
        try {
            setLoading(true);
            const { data } = await getMessages(id);
            initializeMessages(data.data || data);
            setActiveConversationId(id);
            setViewState('chat');
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            setLoading(true);
            const { data } = await createConversation('GENERAL');
            setActiveConversationId(data._id);
            initializeMessages([]);
            setViewState('chat');
            fetchConversations();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!prompt.trim() || isStreaming) return;
        const currentPrompt = prompt;
        setPrompt('');
        streamMessage(activeConversationId, currentPrompt, selectedModel);
    };

    if (viewState === 'list') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
                    <TouchableOpacity onPress={handleNewChat}>
                        <Icon name="edit" size={24} color={theme.cyan} />
                    </TouchableOpacity>
                </View>
                {loading ? <Loader fullScreen /> : (
                    <FlatList
                        data={conversations}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <Card style={[styles.convCard, { backgroundColor: theme.surface }]} onPress={() => loadConversation(item._id)}>
                                <View style={styles.convHeader}>
                                    <Text style={[styles.convTitle, { color: theme.text }]} numberOfLines={1}>{item.title || 'New Conversation'}</Text>
                                </View>
                                <Text style={[styles.convPreview, { color: theme.textMuted }]} numberOfLines={2}>
                                    {item.messages?.[0]?.content || 'Start chatting...'}
                                </Text>
                            </Card>
                        )}
                        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textMuted }]}>No conversations yet.</Text>}
                    />
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.chatHeader, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={() => { setViewState('list'); fetchConversations(); }} style={styles.backBtn}>
                        <Icon name="chevron-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.chatTitle, { color: theme.text }]}>Chat</Text>
                    <TouchableOpacity onPress={() => setIsModelSelectorVisible(true)} style={styles.modelBtn}>
                        <Icon name="cpu" size={20} color={theme.cyan} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
                    contentContainerStyle={styles.chatContent}
                    renderItem={({ item }) => <ChatBubble message={item} />}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={[styles.inputContainer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: '#000', color: theme.text }]}
                        placeholder="Ask AI anything..."
                        placeholderTextColor={theme.textDim}
                        value={prompt}
                        onChangeText={setPrompt}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: theme.cyan }, (!prompt.trim() || isStreaming) && { opacity: 0.5 }]}
                        onPress={handleSend}
                        disabled={!prompt.trim() || isStreaming}
                    >
                        <Icon name="send" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {isModelSelectorVisible && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBottom}>
                            <ModelSelector
                                selectedModel={selectedModel}
                                onSelect={async (m) => {
                                    setSelectedModel(m);
                                    setIsModelSelectorVisible(false);
                                    try { await updateSettings({ chatModel: m }); } catch (err) { console.log(err); }
                                }}
                                onClose={() => setIsModelSelectorVisible(false)}
                            />
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: 'bold' },
    listContent: { padding: 16 },
    convCard: { marginBottom: 12 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    convTitle: { fontSize: typography.fontSizes.md, fontWeight: 'bold', flex: 1 },
    convPreview: { fontSize: typography.fontSizes.sm },
    emptyText: { textAlign: 'center', marginTop: 40 },
    chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    backBtn: { paddingRight: 16 },
    chatTitle: { fontSize: typography.fontSizes.lg, fontWeight: 'bold', flex: 1 },
    modelBtn: { paddingLeft: 16 },
    chatContent: { padding: 16, paddingBottom: 24 },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1 },
    textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: typography.fontSizes.md },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginBottom: 2 },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalBottom: { width: '100%' }
});
