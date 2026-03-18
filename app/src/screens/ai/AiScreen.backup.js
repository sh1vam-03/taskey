
/**
 * AiScreen.js  —  TASKTIME AI  v2
 *
 * ── Fixes from v1 ───────────────────────────────────────────────────────────
 *  1. Removed getMe() auth pre-check (300–600ms latency per message, caused
 *     race conditions with the processing lock)
 *  2. Replaced stale-closure `isStreaming`/`isSending` deps in handleSend
 *     with always-current refs → no phantom "already processing" blocks
 *  3. isProcessing is now BOTH a ref (for sync guards) AND state (for UI)
 *     so the send button actually disables/enables correctly
 *  4. Removed the displayedContent catch-up useEffect that was creating
 *     a self-feeding 25ms re-render loop. Streaming content now renders
 *     directly from streamingContent (updated in useStream, not re-interpolated)
 *  5. handleSend deps pruned → no unnecessary recreations during streaming
 *  6. addMessage deduplication is now inside useStream itself
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Animated, Dimensions,
    TouchableWithoutFeedback, Keyboard, StatusBar, ScrollView,
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
import { useAlert } from '../../context/AlertContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);

const QUICK_PROMPTS = [
    { icon: 'calendar-check', label: 'What should I focus on?', sub: 'Check my tasks & schedule', prompt: 'What should I focus on?' },
    { icon: 'target', label: 'Create a session for me', sub: 'Deep work or task focus', prompt: 'Create a session for me' },
    { icon: 'star-four-points', label: 'What can you do?', sub: 'Explore AI capabilities', prompt: 'What can you do?' },
    { icon: 'clock-outline', label: 'Analyze my time', sub: 'Review habit consistency', prompt: 'Analyze my time' },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function ThinkingDots({ color }) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (v, delay) => Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(v, { toValue: -6, duration: 400, useNativeDriver: true }),
                Animated.timing(v, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.delay(400),
            ])
        );
        const a1 = animate(dot1, 0);
        const a2 = animate(dot2, 150);
        const a3 = animate(dot3, 300);
        a1.start(); a2.start(); a3.start();
        return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);

    return (
        <View style={styles.thinkingDots}>
            <Animated.View style={[styles.thinkingDot, { backgroundColor: color, transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.thinkingDot, { backgroundColor: color, opacity: 0.7, transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.thinkingDot, { backgroundColor: color, opacity: 0.4, transform: [{ translateY: dot3 }] }]} />
        </View>
    );
}

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
            <Animated.View style={{ position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: color, opacity: op2, transform: [{ scale: ring2 }] }} />
            <Animated.View style={{ position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: color, opacity: op1, transform: [{ scale: ring1 }] }} />
            <Icon name="microphone" size={30} color="#000" />
        </View>
    );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function AiScreen() {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [settings, setSettings] = useState(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameText, setRenameText] = useState('');
    const [search, setSearch] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarRendered, setIsSidebarRendered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    // ── FIX #3: isProcessing as BOTH ref (sync guard) AND state (UI) ─────────
    const [isProcessing, setIsProcessing] = useState(false);
    const isProcessingRef = useRef(false);

    const setProcessing = useCallback((val) => {
        isProcessingRef.current = val;
        setIsProcessing(val);
    }, []);

    // ── Other refs ────────────────────────────────────────────────────────────
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const voiceFadeAnim = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const cooldownRef = useRef(false);

    // isStreaming/isSending as refs so handleSend never has stale values
    const isStreamingRef = useRef(false);
    const isSendingRef = useRef(false);

    const {
        messages,
        isStreaming,
        streamingContent,
        isSending,
        streamMessage,
        stopStream,
        initializeMessages,
        addMessage,
    } = useStream();

    // Keep refs in sync with state (FIX #2: handleSend reads refs, not stale closure values)
    useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
    useEffect(() => { isSendingRef.current = isSending; }, [isSending]);

    const { theme, isDark } = useTheme();
    const { alert } = useAlert();
    const navigation = useNavigation();

    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const inputBord = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)';
    const cyan = theme.cyan ?? '#00d4ff';
    const mutedText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

    // ── Sidebar ───────────────────────────────────────────────────────────────
    const toggleSidebar = useCallback((open) => {
        setIsSidebarOpen(open);
        if (open) { Keyboard.dismiss(); setIsSidebarRendered(true); }
        Animated.timing(slideAnim, {
            toValue: open ? 0 : -SIDEBAR_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start(() => { if (!open) setIsSidebarRendered(false); });
    }, [slideAnim]);

    // ── Load conversation messages ────────────────────────────────────────────
    const loadConversation = useCallback(async (id) => {
        if (!id) return;
        try {
            setLoadingMessages(true);
            stopStream(); // cancel any in-flight stream first
            const res = await getMessages(id);
            const responseData = res.data?.data || res.data || [];
            initializeMessages(Array.isArray(responseData) ? responseData : []);
            setActiveConvId(id);
            toggleSidebar(false);
        } catch (err) {
            console.log('loadConversation error:', err);
            initializeMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [initializeMessages, toggleSidebar, stopStream]);

    // ── Fetch conversations list ──────────────────────────────────────────────
    const fetchConversations = useCallback(async (openFirst = false) => {
        try {
            setLoadingConversations(true);
            const { data } = await getConversations();
            const list = data.data || data || [];
            const filtered = search
                ? list.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
                : list;
            setConversations(filtered);
            if (openFirst && filtered.length > 0 && !activeConvId) {
                const firstId = filtered[0].id || filtered[0]._id;
                if (firstId) loadConversation(firstId);
            }
        } catch (err) { console.log('fetchConversations:', err); }
        finally { setLoadingConversations(false); }
    }, [search, loadConversation, activeConvId]);

    const fetchSettings = useCallback(async () => {
        try {
            const { data } = await getSettings();
            setSettings(data?.data || data);
        } catch (err) { console.log('fetchSettings:', err); }
    }, []);

    // Initial load
    useEffect(() => {
        fetchConversations(true);
        fetchSettings();
    }, []); // eslint-disable-line

    // Sidebar search re-fetch
    useEffect(() => {
        if (isSidebarOpen || search) {
            const t = setTimeout(() => fetchConversations(false), 200);
            return () => clearTimeout(t);
        }
    }, [search, isSidebarOpen]); // eslint-disable-line

    // ── Settings ──────────────────────────────────────────────────────────────
    const handleUpdateSettings = useCallback(async (s) => {
        try {
            setSettings(prev => ({ ...prev, ...s }));
            await apiUpdateSettings(s);
        } catch (err) { console.log(err); }
    }, []);

    // ── Delete conversation ───────────────────────────────────────────────────
    const handleDelete = useCallback(async (id) => {
        try {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => (c.id || c._id) !== id));
            if (activeConvId === id) { setActiveConvId(null); initializeMessages([]); }
        } catch (err) { console.log(err); }
    }, [activeConvId, initializeMessages]);

    // ── Rename conversation ───────────────────────────────────────────────────
    const handleRenameSubmit = useCallback(async (id) => {
        if (!renameText.trim()) { setIsRenaming(false); return; }
        try {
            await updateConversation(id, { title: renameText.trim() });
            setConversations(prev => prev.map(c =>
                (c.id === id || c._id === id) ? { ...c, title: renameText.trim() } : c
            ));
        } catch (err) { console.log(err); }
        finally { setIsRenaming(false); }
    }, [renameText]);

    // ── New chat ──────────────────────────────────────────────────────────────
    const handleNewChat = useCallback(() => {
        stopStream();
        setActiveConvId(null);
        initializeMessages([]);
        toggleSidebar(false);
        setProcessing(false);
        cooldownRef.current = false;
    }, [initializeMessages, toggleSidebar, stopStream, setProcessing]);

    // ── SEND ─────────────────────────────────────────────────────────────────
    // FIX #2: deps contain ONLY stable values — no isStreaming/isSending state
    const handleSend = useCallback(async (overrideText) => {
        const text = (overrideText ?? prompt).trim();

        // ── Synchronous guards (use refs for always-current values) ───────────
        if (!text) return;
        if (cooldownRef.current) { console.log('[AiScreen] blocked: cooldown'); return; }
        if (isStreamingRef.current) { console.log('[AiScreen] blocked: streaming'); return; }
        if (isSendingRef.current) { console.log('[AiScreen] blocked: sending'); return; }
        if (isProcessingRef.current) { console.log('[AiScreen] blocked: processing'); return; }

        // ── Lock immediately ──────────────────────────────────────────────────
        setProcessing(true);
        cooldownRef.current = true;
        setPrompt('');

        // ── Ensure conversation exists ────────────────────────────────────────
        let targetId = activeConvId;
        if (!targetId) {
            try {
                const { data } = await createConversation('GENERAL');
                const conv = data.conversation || data.data?.conversation || data.data || data;
                targetId = conv.id || conv._id;
                setActiveConvId(targetId);
                setConversations(prev => [{
                    id: targetId, _id: targetId,
                    title: text.slice(0, 50),
                    updatedAt: new Date(),
                }, ...prev]);
            } catch (err) {
                console.log('createConversation error:', err);
                setProcessing(false);
                cooldownRef.current = false;
                return;
            }
        }

        // ── Optimistic user bubble ────────────────────────────────────────────
        addMessage({
            id: `user-opt-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        });

        // ── Stream ────────────────────────────────────────────────────────────
        streamMessage(targetId, text, settings?.chatModel || 'gemini-1.5-flash', {
            onToken: (_token, _full) => { /* TTS hook-point */ },

            onTitle: (newTitle) => {
                setConversations(prev => prev.map(c =>
                    (c.id === targetId || c._id === targetId)
                        ? { ...c, title: newTitle }
                        : c
                ));
            },

            onWarning: (w) => {
                if (w.code === 402) alert('Credits Finished', w.message, [{ text: 'OK' }]);
            },

            onDone: () => {
                setProcessing(false);
                // Prevent rapid re-send: release cooldown after 1 s
                setTimeout(() => { cooldownRef.current = false; }, 1000);
            },

            onError: (err) => {
                console.log('[AiScreen] stream error:', err);
                setProcessing(false);
                cooldownRef.current = false;
            },
        });

        // FIX #2: removed isStreaming, isSending — we use refs for those
    }, [prompt, activeConvId, settings, streamMessage, alert, addMessage, setProcessing]);

    // ── Voice ─────────────────────────────────────────────────────────────────
    const handleVoiceToggle = useCallback(() => {
        if (isRecording) {
            setIsRecording(false);
            Animated.timing(voiceFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
            if (voiceTranscript.trim()) {
                handleSend(voiceTranscript.trim());
                setVoiceTranscript('');
            }
        } else {
            Keyboard.dismiss();
            setIsRecording(true);
            setVoiceTranscript('Simulation: What is my next task?');
            Animated.timing(voiceFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
    }, [isRecording, voiceTranscript, handleSend, voiceFadeAnim]);

    // ── Derived UI values ─────────────────────────────────────────────────────
    const modelLabel = settings?.chatModel
        ? settings.chatModel.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Gemini 2.0 Flash';

    // FIX #3: button disabled uses `isProcessing` STATE (re-renders correctly)
    const isBusy = isStreaming || isSending || isProcessing;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                {/* ── Header ── */}
                <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: glassBord }]}>
                    <TouchableOpacity
                        onPress={() => toggleSidebar(true)}
                        style={[styles.iconBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Icon name="menu" size={22} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.titleBlock} pointerEvents="none">
                        <View style={styles.titleRow}>
                            <Svg height={22} width={175}>
                                <Defs>
                                    <LinearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={isDark ? '#ffffff' : '#1a1a1a'} />
                                        <Stop offset="0.6" stopColor={isDark ? '#cccccc' : '#333333'} />
                                        <Stop offset="1" stopColor={isDark ? '#777777' : '#000000'} />
                                    </LinearGradient>
                                </Defs>
                                <SvgText fill="url(#ttGrad)" fontSize="16" fontWeight="900" x="10" y="18" letterSpacing="3.5">
                                    TASKTIME AI
                                </SvgText>
                            </Svg>
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

                {/* ── Message area ── */}
                {loadingMessages ? (
                    <View style={styles.centered}>
                        <Text style={[styles.stateTxt, { color: mutedText }]}>Loading…</Text>
                    </View>
                ) : messages.length === 0 ? (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <ScrollView
                            contentContainerStyle={styles.emptyState}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={[styles.aiIcon, { borderColor: cyan + '40', backgroundColor: cyan + '12' }]}>
                                <Icon name="star-four-points" size={28} color={cyan} />
                            </View>
                            <Text style={[styles.greeting, { color: theme.text }]}>How can I help you?</Text>
                            <Text style={[styles.greetingSub, { color: mutedText }]}>
                                Ask me anything about your tasks, schedule, or habits.{'\n'}
                                I'm here to help you stay organized and productive.
                            </Text>
                            <View style={styles.quickGrid}>
                                {QUICK_PROMPTS.map((qp, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.quickChip, { backgroundColor: glassBg, borderColor: glassBord }]}
                                        onPress={() => handleSend(qp.prompt)}
                                        disabled={isBusy}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={[styles.quickChipIcon, { backgroundColor: cyan + '18' }]}>
                                                <Icon name={qp.icon} size={16} color={cyan} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.quickChipTxt, { color: theme.text }]}>{qp.label}</Text>
                                                <Text style={[styles.quickChipSub, { color: mutedText }]}>{qp.sub}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item, idx) =>
                            item.id?.toString() || item._id?.toString() || `msg-${idx}`
                        }
                        style={styles.flex}
                        contentContainerStyle={styles.chatContent}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListFooterComponent={
                            <View style={{ paddingBottom: 20 }}>
                                {/* FIX #4: render streamingContent directly — no re-interpolation layer */}
                                {isStreaming && streamingContent ? (
                                    <ChatBubble message={{
                                        role: 'assistant',
                                        content: streamingContent,
                                        isStreaming: true,
                                        model: settings?.chatModel || 'gemini-1.5-flash',
                                    }} />
                                ) : null}
                                {isStreaming && !streamingContent && (
                                    <View style={styles.thinkingRow}>
                                        <ThinkingDots color={cyan} />
                                        <Text style={[styles.thinkingTxt, { color: mutedText }]}>Thinking...</Text>
                                    </View>
                                )}
                            </View>
                        }
                    />
                )}

                {/* ── Input area ── */}
                <View style={[styles.inputArea, { paddingBottom: Platform.OS === 'ios' ? 22 : 10, borderTopColor: glassBord }]}>
                    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: focused ? cyan + '90' : inputBord }]}>

                        <TouchableOpacity
                            onPress={handleVoiceToggle}
                            style={[
                                styles.roundBtn,
                                isRecording
                                    ? { backgroundColor: '#ff3b30' }
                                    : { backgroundColor: glassBg, borderColor: glassBord, borderWidth: 1 },
                                { marginRight: 8 },
                            ]}
                        >
                            <Icon
                                name={isRecording ? 'microphone-off' : 'microphone'}
                                size={17}
                                color={isRecording ? '#fff' : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsVoiceMode(!isVoiceMode)}
                            style={[
                                styles.roundBtn,
                                {
                                    marginRight: 4,
                                    backgroundColor: isVoiceMode ? cyan + '30' : glassBg,
                                    borderColor: isVoiceMode ? cyan : glassBord,
                                    borderWidth: 1,
                                },
                            ]}
                        >
                            <Icon name={isVoiceMode ? 'headset' : 'headset-off-outline'} size={17} color={isVoiceMode ? cyan : mutedText} />
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
                            editable={!isBusy}
                        />

                        {/* FIX #3: disabled uses isBusy which includes isProcessing STATE */}
                        <TouchableOpacity
                            style={[
                                styles.roundBtn,
                                { backgroundColor: cyan, marginLeft: 6 },
                                (!prompt.trim() && !isStreaming) && { opacity: 0.36 },
                            ]}
                            onPress={() => isStreaming ? stopStream() : handleSend()}
                            disabled={(!prompt.trim() && !isStreaming) || isBusy}
                        >
                            {isStreaming
                                ? <Icon name="stop" size={15} color="#000" />
                                : <Icon name="arrow-up" size={19} color="#000" />
                            }
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.disclaimer, { color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.25)' }]}>
                        AI can make mistakes. Please verify important information.
                    </Text>
                </View>

                <AiSettingsModal
                    visible={isSettingsVisible}
                    onClose={() => setIsSettingsVisible(false)}
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                />
            </KeyboardAvoidingView>

            {/* ── Voice overlay ── */}
            <Animated.View
                pointerEvents={isRecording ? 'auto' : 'none'}
                style={[styles.voiceOverlay, { opacity: voiceFadeAnim }]}
            >
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

            {/* ── Sidebar ── */}
            {isSidebarOpen && (
                <TouchableWithoutFeedback onPress={() => toggleSidebar(false)}>
                    <View style={styles.sidebarOverlay} />
                </TouchableWithoutFeedback>
            )}
            <Animated.View
                pointerEvents={isSidebarOpen ? 'auto' : 'none'}
                style={[
                    styles.sidebarPanel,
                    { backgroundColor: theme.bg, borderRightColor: glassBord, transform: [{ translateX: slideAnim }] },
                ]}
            >
                {isSidebarRendered && (
                    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
                        <View style={[styles.sidebarHeader, { borderBottomColor: glassBord }]}>
                            <Svg height={19} width={155}>
                                <Defs>
                                    <LinearGradient id="sbGrad" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={isDark ? '#fff' : '#222'} />
                                        <Stop offset="1" stopColor={isDark ? '#888' : '#000'} />
                                    </LinearGradient>
                                </Defs>
                                <SvgText fill="url(#sbGrad)" fontSize="13" fontWeight="900" x="4" y="14" letterSpacing="3">
                                    TASKTIME AI
                                </SvgText>
                            </Svg>
                            <TouchableOpacity
                                onPress={() => { toggleSidebar(false); navigation.navigate('Home'); }}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Icon name="arrow-left" size={14} color={mutedText} />
                                <Text style={{ color: theme.text, marginLeft: 4 }}>Home</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
                            <TouchableOpacity
                                onPress={handleNewChat}
                                style={[styles.newChatBtn, { backgroundColor: cyan + '18', borderColor: cyan + '40' }]}
                            >
                                <Icon name="plus" size={17} color={cyan} />
                                <Text style={[styles.newChatTxt, { color: cyan }]}>New Chat</Text>
                            </TouchableOpacity>

                            <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBord }]}>
                                <Icon name="magnify" size={16} color={mutedText} style={{ marginLeft: 11 }} />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Search…"
                                    placeholderTextColor={mutedText}
                                    style={[styles.searchInput, { color: theme.text }]}
                                />
                            </View>
                        </View>

                        <FlatList
                            data={conversations}
                            keyExtractor={item => item.id || item._id}
                            renderItem={({ item }) => {
                                const convId = item.id || item._id;
                                const isActive = activeConvId === convId;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.convCard,
                                            {
                                                backgroundColor: isActive ? cyan + '18' : glassBg,
                                                borderColor: isActive ? cyan + '40' : glassBord,
                                                marginBottom: 8,
                                                marginHorizontal: 14,
                                            },
                                        ]}
                                        onPress={() => loadConversation(convId)}
                                    >
                                        <View style={[styles.stripe, { backgroundColor: isActive ? cyan : 'transparent' }]} />
                                        <View style={styles.convInner}>
                                            <Text style={[styles.convTitle, { color: theme.text }]} numberOfLines={1}>
                                                {item.title || 'New Chat'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </SafeAreaView>
                )}
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
    iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    titleBlock: { flex: 1, justifyContent: 'center' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    subTxt: { fontSize: 11, fontWeight: '600' },
    alphaTag: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    alphaTagTxt: { fontSize: 9, fontWeight: '900' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stateTxt: { fontSize: 14 },
    emptyState: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    aiIcon: { width: 60, height: 60, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    greeting: { fontSize: 22, fontWeight: '800' },
    greetingSub: { fontSize: 13, textAlign: 'center', marginVertical: 10 },
    quickGrid: { width: '100%', gap: 8 },
    quickChip: { padding: 14, borderRadius: 16, borderWidth: 1 },
    quickChipIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    quickChipTxt: { fontSize: 14, fontWeight: '700' },
    quickChipSub: { fontSize: 12, marginTop: 2 },
    chatContent: { padding: 16 },
    inputArea: { paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 26, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 6, minHeight: 50 },
    chatInput: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
    roundBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    disclaimer: { textAlign: 'center', fontSize: 10, marginTop: 8 },
    thinkingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
    thinkingDots: { flexDirection: 'row', gap: 4 },
    thinkingDot: { width: 5, height: 5, borderRadius: 2.5 },
    thinkingTxt: { fontSize: 13 },
    voiceOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    voiceCard: { width: '80%', padding: 30, borderRadius: 30, borderWidth: 1, alignItems: 'center' },
    micCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    voiceTitle: { fontSize: 20, fontWeight: '800' },
    voiceSub: { fontSize: 14, textAlign: 'center', marginVertical: 15 },
    voiceStopBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1 },
    sidebarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 },
    sidebarPanel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH, borderRightWidth: 1, zIndex: 60 },
    sidebarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
    newChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
    newChatTxt: { fontWeight: '700', marginLeft: 6 },
    searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, height: 40 },
    searchInput: { flex: 1, marginLeft: 10 },
    convCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    stripe: { width: 4 },
    convInner: { flex: 1, padding: 12 },
    convTitle: { fontWeight: '700' },
});
