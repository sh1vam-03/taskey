import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Animated, Dimensions,
    TouchableWithoutFeedback, Keyboard, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    getConversations, getMessages, createConversation,
    getSettings, updateSettings as apiUpdateSettings,
    deleteConversation, updateConversation,
} from '../../api/ai.api';
import { useStream } from '../../hooks/useStream';
import ChatBubble from './components/ChatBubble';
import AiSettingsModal from './components/AiSettingsModal';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);

function getGreeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
}

const QUICK_PROMPTS = [
    { icon: 'calendar-check', label: 'Plan my day', prompt: 'Help me plan my day efficiently.' },
    { icon: 'lightbulb-outline', label: 'Brainstorm', prompt: 'I need help brainstorming ideas.' },
    { icon: 'format-list-checks', label: 'Create task list', prompt: 'Help me create a structured task list.' },
    { icon: 'clock-fast', label: 'Prioritize tasks', prompt: 'Help me prioritize my tasks by urgency and importance.' },
];

function MicPulse({ color }) {
    const ring1 = useRef(new Animated.Value(1)).current;
    const ring2 = useRef(new Animated.Value(1)).current;
    const op1 = useRef(new Animated.Value(0.55)).current;
    const op2 = useRef(new Animated.Value(0.35)).current;
    useEffect(() => {
        const loop = () => Animated.parallel([
            Animated.sequence([
                Animated.timing(ring1, { toValue: 1.65, duration: 700, useNativeDriver: true }),
                Animated.timing(ring1, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.timing(op1, { toValue: 0, duration: 700, useNativeDriver: true }),
                Animated.timing(op1, { toValue: 0.55, duration: 700, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.delay(250),
                Animated.timing(ring2, { toValue: 2.3, duration: 900, useNativeDriver: true }),
                Animated.timing(ring2, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.delay(250),
                Animated.timing(op2, { toValue: 0, duration: 900, useNativeDriver: true }),
                Animated.timing(op2, { toValue: 0.35, duration: 500, useNativeDriver: true }),
            ]),
        ]).start(() => loop());
        loop();
    }, []);
    return (
        <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={{
                position: 'absolute', width: 72, height: 72, borderRadius: 36,
                backgroundColor: color, opacity: op2, transform: [{ scale: ring2 }],
            }} />
            <Animated.View style={{
                position: 'absolute', width: 72, height: 72, borderRadius: 36,
                backgroundColor: color, opacity: op1, transform: [{ scale: ring1 }],
            }} />
            <Icon name="microphone" size={30} color="#000" />
        </View>
    );
}

export default function AiScreen() {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [settings, setSettings] = useState(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [activeActionId, setActiveActionId] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameText, setRenameText] = useState('');
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarRendered, setIsSidebarRendered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');

    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const voiceFadeAnim = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    const { messages, isStreaming, streamMessage, initializeMessages } = useStream();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
    const cyan = theme.cyan ?? '#00d4ff';
    const mutedText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

    const toggleSidebar = useCallback((open) => {
        setIsSidebarOpen(open);
        if (open) { Keyboard.dismiss(); setIsSidebarRendered(true); }
        Animated.timing(slideAnim, {
            toValue: open ? 0 : -SIDEBAR_WIDTH,
            duration: 300, useNativeDriver: true,
        }).start(() => { if (!open) setIsSidebarRendered(false); });
    }, [slideAnim]);

    const loadConversation = useCallback(async (id) => {
        try {
            setLoadingMessages(true);
            const { data } = await getMessages(id);
            initializeMessages(data.data || data);
            setActiveConvId(id);
            toggleSidebar(false);
        } catch (err) { console.log('loadConversation:', err); }
        finally { setLoadingMessages(false); }
    }, [initializeMessages, toggleSidebar]);

    const fetchConversations = useCallback(async (openFirst = false) => {
        try {
            setLoadingConversations(true);
            const { data } = await getConversations();
            const list = data.data || data;
            const filtered = search
                ? list.filter(c =>
                    c.title?.toLowerCase().includes(search.toLowerCase()) ||
                    c.messages?.[0]?.content?.toLowerCase().includes(search.toLowerCase()))
                : list;
            setConversations(filtered);
            if (openFirst && filtered.length > 0) loadConversation(filtered[0]._id);
        } catch (err) { console.log('fetchConversations:', err); }
        finally { setLoadingConversations(false); }
    }, [search, loadConversation]);

    const fetchSettings = useCallback(async () => {
        try {
            const { data } = await getSettings();
            setSettings(data?.data || data);
        } catch (err) { console.log('fetchSettings:', err); }
    }, []);

    useEffect(() => { fetchConversations(true); fetchSettings(); }, []); // eslint-disable-line
    useEffect(() => { fetchConversations(false); }, [search]);            // eslint-disable-line
    useEffect(() => { if (isSidebarOpen) fetchConversations(false); }, [isSidebarOpen]); // eslint-disable-line

    const handleUpdateSettings = useCallback(async (s) => {
        try { setSettings(prev => ({ ...prev, ...s })); await apiUpdateSettings(s); }
        catch (err) { console.log(err); }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c._id !== id));
            if (activeConvId === id) { setActiveConvId(null); initializeMessages([]); }
            setActiveActionId(null);
        } catch (err) { console.log(err); }
    }, [activeConvId, initializeMessages]);

    const handleRenameSubmit = useCallback(async (id) => {
        if (!renameText.trim()) { setIsRenaming(false); setActiveActionId(null); return; }
        try {
            await updateConversation(id, { title: renameText.trim() });
            setConversations(prev => prev.map(c => c._id === id ? { ...c, title: renameText.trim() } : c));
        } catch (err) { console.log(err); }
        finally { setIsRenaming(false); setActiveActionId(null); }
    }, [renameText]);

    const handleNewChat = useCallback(() => {
        setActiveConvId(null); initializeMessages([]); toggleSidebar(false);
    }, [initializeMessages, toggleSidebar]);

    const handleSend = useCallback(async (overrideText) => {
        const text = (overrideText || prompt).trim();
        if (!text || isStreaming) return;
        setPrompt('');
        let targetId = activeConvId;
        if (!targetId) {
            try {
                const { data } = await createConversation('GENERAL');
                targetId = data._id || data.data?._id;
                setActiveConvId(targetId);
                setConversations(prev => [{ _id: targetId, title: text.slice(0, 50), updatedAt: new Date() }, ...prev]);
            } catch (err) { console.log('createConversation:', err); return; }
        }
        streamMessage(targetId, text, settings?.chatModel || 'gemini-2.0-flash');
    }, [prompt, isStreaming, activeConvId, settings, streamMessage]);

    const handleVoiceToggle = useCallback(() => {
        if (isRecording) {
            // TODO: Voice.stop()  — wire up react-native-voice / expo-speech
            setIsRecording(false);
            Animated.timing(voiceFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
            if (voiceTranscript.trim()) { handleSend(voiceTranscript.trim()); setVoiceTranscript(''); }
        } else {
            // TODO: Voice.start(settings?.sttModel || 'en-IN')
            // TODO: Voice.onSpeechResults = e => setVoiceTranscript(e.value?.[0] || '')
            // TODO: Voice.onSpeechError   = () => handleVoiceToggle()
            Keyboard.dismiss();
            setIsRecording(true);
            setVoiceTranscript('');
            Animated.timing(voiceFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
    }, [isRecording, voiceTranscript, voiceFadeAnim, handleSend]);

    const modelLabel = settings?.chatModel
        ? settings.chatModel.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Gemini 2.0 Flash';

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* ── HEADER ── */}
                <View style={[styles.header, {
                    backgroundColor: theme.bg,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }]}>
                    <TouchableOpacity
                        onPress={() => toggleSidebar(true)}
                        style={[styles.iconBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Icon name="menu" size={22} color={theme.text} />
                    </TouchableOpacity>

                    {/* Title: flex:1 + marginLeft so it never overlaps the menu button */}
                    <View style={styles.titleBlock} pointerEvents="none">
                        <View style={styles.titleRow}>
                            <Svg height={22} width={175}>
                                <Defs>
                                    <LinearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={isDark ? '#ffffff' : '#1a1a1a'} stopOpacity="1" />
                                        <Stop offset="0.6" stopColor={isDark ? '#cccccc' : '#333333'} stopOpacity="1" />
                                        <Stop offset="1" stopColor={isDark ? '#777777' : '#000000'} stopOpacity="1" />
                                    </LinearGradient>
                                </Defs>
                                <SvgText fill="url(#ttGrad)" fontSize="16" fontWeight="900" x="10" y="18" letterSpacing="3.5">
                                    TASKTIME AI
                                </SvgText>
                            </Svg>
                            {/* vALPHA tag — same style as web version */}
                            <View style={[styles.alphaTag, { backgroundColor: cyan + '20', borderColor: cyan }]}>
                                <Text style={[styles.alphaTagTxt, { color: cyan }]}>vALPHA</Text>
                            </View>
                        </View>
                        <View style={styles.subRow}>
                            <Icon name="lightning-bolt" size={11} color={cyan} style={{ marginRight: 3 }} />
                            <Text style={[styles.subTxt, { color: cyan }]}>{settings?.creditBalance ?? 0} credits</Text>
                            <Text style={[styles.subTxt, { color: mutedText, marginLeft: 5 }]}>• {settings?.plan || 'FREE'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setIsSettingsVisible(true)}
                        style={[styles.iconBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Icon name="cog" size={20} color={isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'} />
                    </TouchableOpacity>
                </View>

                {/* ── MESSAGES / EMPTY ── */}
                {loadingMessages ? (
                    <View style={styles.centered}>
                        <Text style={[styles.stateTxt, { color: mutedText }]}>Loading…</Text>
                    </View>
                ) : (!messages || messages.length === 0) ? (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={styles.emptyState}>
                            <View style={[styles.aiIcon, { borderColor: cyan + '40', backgroundColor: cyan + '12' }]}>
                                <Icon name="star-four-points" size={28} color={cyan} />
                            </View>
                            <Text style={[styles.greeting, { color: theme.text }]}>{getGreeting()}!</Text>
                            <Text style={[styles.greetingSub, { color: mutedText }]}>How can I help you today?</Text>
                            <View style={styles.quickGrid}>
                                {QUICK_PROMPTS.map((qp, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.quickChip, { backgroundColor: glassBg, borderColor: glassBord }]}
                                        onPress={() => handleSend(qp.prompt)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name={qp.icon} size={15} color={cyan} style={{ marginBottom: 6 }} />
                                        <Text style={[styles.quickChipTxt, { color: theme.text }]}>{qp.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                ) : (
                    /* FIX keyboard dismiss: keyboardShouldPersistTaps="handled" */
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
                        contentContainerStyle={styles.chatContent}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    />
                )}

                {/* ── INPUT BAR ── */}
                <View style={[styles.inputArea, {
                    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
                    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }]}>
                    {/* FIX placeholder off-centre: alignItems:'center' + no paddingVertical on input */}
                    <View style={[styles.inputRow, {
                        backgroundColor: inputBg,
                        borderColor: focused ? cyan + '90' : inputBord,
                        ...(Platform.OS === 'ios' && focused ? {
                            shadowColor: cyan, shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.2, shadowRadius: 8,
                        } : {}),
                    }]}>
                        <TouchableOpacity
                            onPress={handleVoiceToggle}
                            style={[styles.roundBtn, isRecording
                                ? { backgroundColor: '#ff3b30' }
                                : { backgroundColor: glassBg, borderColor: glassBord, borderWidth: 1 },
                            { marginRight: 8 }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name={isRecording ? 'microphone-off' : 'microphone'}
                                size={17}
                                color={isRecording ? '#fff' : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')}
                            />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.chatInput, { color: theme.text }]}
                            placeholder="Chat with TASKTIME AI…"
                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)'}
                            value={prompt}
                            onChangeText={setPrompt}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            multiline
                            maxLength={1000}
                            textAlignVertical="center"
                        />
                        <TouchableOpacity
                            style={[styles.roundBtn, { backgroundColor: cyan, marginLeft: 6 },
                            (!prompt.trim() || isStreaming) && { opacity: 0.36 }]}
                            onPress={() => handleSend()}
                            disabled={!prompt.trim() || isStreaming}
                        >
                            {isStreaming
                                ? <Icon name="stop" size={15} color="#000" />
                                : <Icon name="arrow-up" size={19} color="#000" />}
                        </TouchableOpacity>
                    </View>

                    {isStreaming && (
                        <View style={styles.streamRow}>
                            <View style={[styles.streamDot, { backgroundColor: cyan }]} />
                            <Text style={[styles.streamTxt, { color: mutedText }]}>AI is responding…</Text>
                        </View>
                    )}
                </View>

                <AiSettingsModal
                    visible={isSettingsVisible}
                    onClose={() => setIsSettingsVisible(false)}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    isLoading={false}
                />
            </KeyboardAvoidingView>

            {/* ── VOICE OVERLAY ── */}
            <Animated.View
                pointerEvents={isRecording ? 'auto' : 'none'}
                style={[styles.voiceOverlay, { opacity: voiceFadeAnim }]}
            >
                <TouchableWithoutFeedback onPress={handleVoiceToggle}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <View style={[styles.voiceCard, { backgroundColor: isDark ? '#111' : '#fff', borderColor: glassBord }]}>
                    <View style={[styles.micCircle, { backgroundColor: cyan }]}>
                        <MicPulse color={cyan} />
                    </View>
                    <Text style={[styles.voiceTitle, { color: theme.text }]}>Listening…</Text>
                    <Text style={[styles.voiceSub, { color: mutedText }]}>
                        {voiceTranscript || 'Speak now — tap mic to stop'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleVoiceToggle}
                        style={[styles.voiceStopBtn, { backgroundColor: '#ff3b3018', borderColor: '#ff3b3055' }]}
                    >
                        <Icon name="stop-circle" size={18} color="#ff3b30" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#ff3b30', fontWeight: '700', fontSize: 14 }}>Stop & Send</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* ── SIDEBAR ── */}
            {isSidebarOpen && (
                <TouchableWithoutFeedback onPress={() => toggleSidebar(false)}>
                    <View style={styles.sidebarOverlay} />
                </TouchableWithoutFeedback>
            )}
            <Animated.View
                pointerEvents={isSidebarOpen ? 'auto' : 'none'}
                style={[styles.sidebarPanel, {
                    backgroundColor: theme.bg,
                    borderRightColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    transform: [{ translateX: slideAnim }],
                }]}
            >
                {isSidebarRendered && (
                    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
                        <View style={[styles.sidebarHeader, {
                            borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                        }]}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg height={19} width={155}>
                                        <Defs>
                                            <LinearGradient id="sbGrad" x1="0" y1="0" x2="0" y2="1">
                                                <Stop offset="0" stopColor={isDark ? '#fff' : '#222'} stopOpacity="1" />
                                                <Stop offset="1" stopColor={isDark ? '#888' : '#000'} stopOpacity="1" />
                                            </LinearGradient>
                                        </Defs>
                                        <SvgText fill="url(#sbGrad)" fontSize="13" fontWeight="900" x="4" y="14" letterSpacing="3">
                                            TASKTIME AI
                                        </SvgText>
                                    </Svg>
                                    <View style={[styles.alphaTagSm, { backgroundColor: cyan + '20', borderColor: cyan }]}>
                                        <Text style={[styles.alphaTagSmTxt, { color: cyan }]}>vALPHA</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 11, fontWeight: '500', marginTop: 3, color: mutedText }}>
                                    Conversation history
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => { toggleSidebar(false); navigation.navigate('Home'); }}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4 }}
                                activeOpacity={0.7}
                            >
                                <Icon name="arrow-left" size={14} color={mutedText} />
                                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginLeft: 4 }}>Home</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
                            <TouchableOpacity
                                onPress={handleNewChat}
                                style={[styles.newChatBtn, { backgroundColor: cyan + '18', borderColor: cyan + '40' }]}
                                activeOpacity={0.75}
                            >
                                <Icon name="plus" size={17} color={cyan} />
                                <Text style={[styles.newChatTxt, { color: cyan }]}>New Chat</Text>
                            </TouchableOpacity>
                            <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBord }]}>
                                <Icon name="magnify" size={16} color={mutedText} style={{ marginLeft: 11 }} />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Search conversations…"
                                    placeholderTextColor={mutedText}
                                    editable={isSidebarOpen}
                                    style={[styles.searchInput, { color: theme.text }]}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
                                        <Icon name="close-circle" size={15} color={mutedText} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {loadingConversations && conversations.length === 0 ? (
                            <View style={styles.centered}>
                                <Text style={[styles.stateTxt, { color: mutedText }]}>Loading…</Text>
                            </View>
                        ) : conversations.length === 0 ? (
                            <View style={[styles.centered, { paddingTop: 40 }]}>
                                <Icon name="chat-outline" size={30} color={mutedText} />
                                <Text style={[styles.stateTxt, { color: mutedText, marginTop: 10 }]}>
                                    {search ? 'No results' : 'No conversations yet'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={conversations}
                                keyExtractor={item => item._id}
                                contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40, paddingTop: 4 }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => {
                                    const isActive = activeConvId === item._id;
                                    const isEditing = isRenaming && activeActionId === item._id;
                                    return (
                                        <View style={{ position: 'relative', marginBottom: 8 }}>
                                            <TouchableOpacity
                                                style={[styles.convCard, {
                                                    backgroundColor: isActive ? cyan + '18' : glassBg,
                                                    borderColor: isActive ? cyan + '40' : glassBord,
                                                }]}
                                                onPress={() => !isEditing && loadConversation(item._id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[styles.stripe, { backgroundColor: isActive ? cyan : 'transparent' }]} />
                                                <View style={styles.convInner}>
                                                    <View style={[styles.convIcon, {
                                                        backgroundColor: isActive ? cyan + '22' : glassBg,
                                                        borderColor: isActive ? cyan + '44' : glassBord,
                                                    }]}>
                                                        <Icon name="chat-processing-outline" size={14} color={isActive ? cyan : mutedText} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        {isEditing ? (
                                                            <TextInput
                                                                style={[styles.renameInput, { color: theme.text, backgroundColor: inputBg, borderColor: cyan }]}
                                                                value={renameText}
                                                                onChangeText={setRenameText}
                                                                autoFocus
                                                                onSubmitEditing={() => handleRenameSubmit(item._id)}
                                                                onBlur={() => handleRenameSubmit(item._id)}
                                                            />
                                                        ) : (
                                                            <>
                                                                <Text style={[styles.convTitle, { color: theme.text }]} numberOfLines={1}>
                                                                    {item.title || 'New Conversation'}
                                                                </Text>
                                                                <Text style={[styles.convDate, { color: mutedText }]}>
                                                                    {new Date(item.updatedAt).toLocaleDateString()}
                                                                </Text>
                                                            </>
                                                        )}
                                                    </View>
                                                    {!isEditing && (
                                                        <TouchableOpacity
                                                            onPress={() => setActiveActionId(activeActionId === item._id ? null : item._id)}
                                                            style={{ padding: 6 }}
                                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                        >
                                                            <Icon name="dots-horizontal" size={16} color={mutedText} />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                            {activeActionId === item._id && !isEditing && (
                                                <View style={[styles.popover, {
                                                    backgroundColor: isDark ? '#1c1c1c' : '#fff',
                                                    borderColor: glassBord,
                                                }]}>
                                                    <TouchableOpacity
                                                        style={styles.popoverBtn}
                                                        onPress={() => { setRenameText(item.title || ''); setIsRenaming(true); }}
                                                    >
                                                        <Icon name="pencil-outline" size={14} color={theme.text} style={{ marginRight: 8 }} />
                                                        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>Rename</Text>
                                                    </TouchableOpacity>
                                                    <View style={{ height: 1, backgroundColor: glassBord }} />
                                                    <TouchableOpacity
                                                        style={styles.popoverBtn}
                                                        onPress={() => handleDelete(item._id)}
                                                    >
                                                        <Icon name="delete-outline" size={14} color="#ff4444" style={{ marginRight: 8 }} />
                                                        <Text style={{ color: '#ff4444', fontSize: 13, fontWeight: '500' }}>Delete</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        )}
                    </SafeAreaView>
                )}
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, gap: 10,
    },
    iconBtn: {
        width: 38, height: 38, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    titleBlock: { flex: 1, justifyContent: 'center', paddingLeft: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    subTxt: { fontSize: 11, fontWeight: '600' },
    alphaTag: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    alphaTagTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
    alphaTagSm: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
    alphaTagSmTxt: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stateTxt: { fontSize: 14, fontWeight: '500' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    aiIcon: { width: 60, height: 60, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    greeting: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: -0.4 },
    greetingSub: { fontSize: 14, fontWeight: '500', marginTop: 6, marginBottom: 28, textAlign: 'center' },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: '100%' },
    quickChip: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center' },
    quickChipTxt: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
    chatContent: { padding: 16, paddingBottom: 24 },
    inputArea: { paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
    modelChip: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
    },
    modelChipTxt: { fontSize: 12, fontWeight: '600', maxWidth: 150 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',       /* KEY FIX: was flex-end → placeholder now centred */
        borderRadius: 26, borderWidth: 1,
        paddingHorizontal: 6, paddingVertical: 6,
        minHeight: 50,
    },
    chatInput: {
        flex: 1, paddingHorizontal: 10,
        maxHeight: 120, fontSize: 15, fontWeight: '500', lineHeight: 20,
        /* NO paddingVertical — alignItems:center on parent handles it */
    },
    roundBtn: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    streamRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 2 },
    streamDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    streamTxt: { fontSize: 12, fontWeight: '500' },
    voiceOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.78)',
        alignItems: 'center', justifyContent: 'center', zIndex: 200,
    },
    voiceCard: {
        width: SCREEN_WIDTH * 0.82, borderRadius: 28, borderWidth: 1,
        padding: 28, alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24 },
            android: { elevation: 16 },
        }),
    },
    micCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    voiceTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    voiceSub: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    voiceStopBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 14 },
    voiceHint: { fontSize: 11, fontWeight: '500' },
    sidebarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 },
    sidebarPanel: {
        position: 'absolute', top: 0, bottom: 0, left: 0,
        width: SIDEBAR_WIDTH, borderRightWidth: 1, zIndex: 100,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 6, height: 0 }, shadowOpacity: 0.18, shadowRadius: 16 },
            android: { elevation: 14 },
        }),
    },
    sidebarHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
    },
    newChatBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 7,
    },
    newChatTxt: { fontSize: 14, fontWeight: '700' },
    searchRow: { height: 42, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchInput: { flex: 1, height: '100%', fontSize: 14, fontWeight: '500', paddingHorizontal: 8 },
    convCard: { borderRadius: 14, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
    stripe: { width: 3, alignSelf: 'stretch' },
    convInner: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 11, gap: 10 },
    convIcon: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    convTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    convDate: { fontSize: 10, fontWeight: '500' },
    popover: {
        position: 'absolute', top: 40, right: 6,
        borderRadius: 10, borderWidth: 1, zIndex: 99, elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 6,
        minWidth: 130, overflow: 'hidden',
    },
    popoverBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
    renameInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, fontWeight: '600' },
});