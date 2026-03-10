import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet,
    Platform, Animated, Dimensions, TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AiSettingsModal({
    visible,
    onClose,
    settings,
    onUpdateSettings,
    isLoading = false,
}) {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const cyan = theme.cyan || '#00d4ff';

    const surfaceBg = isDark ? '#161616' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const glassBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

    const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 25,
                stiffness: 250,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setIsRendered(false));
        }
    }, [visible]);

    // Only skip render when not rendered AND not animating out
    if (!isRendered && !visible) return null;

    const renderModelSection = (title, subtitle, models, selectedKey, fieldKey, note, emptyMsg) => (
        <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>{title}</Text>
            {subtitle && (
                <Text style={[styles.sectionSubtitle, { color: textMuted }]}>{subtitle}</Text>
            )}

            {isLoading ? (
                <View style={[styles.emptyContainer, { borderColor }]}>
                    <ActivityIndicator size="small" color={cyan} style={{ marginRight: 8 }} />
                    <Text style={{ color: textMuted }}>Loading models...</Text>
                </View>
            ) : models?.length > 0 ? (
                <View style={styles.grid}>
                    {models.map(m => {
                        const isSelected = settings[selectedKey] === m.id;
                        return (
                            <TouchableOpacity
                                key={m.id}
                                onPress={() => onUpdateSettings({ [fieldKey]: m.id })}
                                style={[
                                    styles.modelCard,
                                    {
                                        borderColor: isSelected ? cyan : borderColor,
                                        backgroundColor: isSelected ? cyan + '18' : glassBg,
                                    }
                                ]}
                                activeOpacity={0.75}
                            >
                                {isSelected && (
                                    <View style={[styles.selectedDot, { backgroundColor: cyan }]} />
                                )}
                                <Text style={[
                                    styles.modelName,
                                    { color: isSelected ? cyan : theme.text }
                                ]}>
                                    {m.name || m.id}
                                </Text>
                                {isSelected && (
                                    <Icon name="check" size={14} color={cyan} style={{ marginTop: 4 }} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.emptyContainer, { borderColor }]}
                    activeOpacity={0.8}
                >
                    <Icon name="lock-outline" size={15} color={textMuted} style={{ marginRight: 8 }} />
                    <Text style={{ color: textMuted, flex: 1, fontSize: 13 }}>
                        {emptyMsg || 'Not available on current plan'}
                    </Text>
                    <Icon name="arrow-right" size={14} color={cyan} />
                </TouchableOpacity>
            )}

            {note && (
                <View style={[styles.noteRow, { backgroundColor: cyan + '10', borderColor: cyan + '25' }]}>
                    <Icon name="information-outline" size={13} color={cyan} style={{ marginRight: 6, flexShrink: 0 }} />
                    <Text style={[styles.noteText, { color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }]}>
                        {note}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <Modal
            visible={isRendered}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                <Animated.View style={[
                    styles.container,
                    {
                        backgroundColor: surfaceBg,
                        paddingTop: insets.top || (Platform.OS === 'ios' ? 44 : 16),
                        paddingBottom: insets.bottom,
                        transform: [{ translateX: slideAnim }],
                    }
                ]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: borderColor }]}>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>AI Settings</Text>
                            <Text style={[styles.headerSub, { color: textMuted }]}>Customize models & capabilities</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeBtn, { backgroundColor: glassBg, borderColor }]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="close" size={20} color={textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Plan badge */}
                    {settings?.plan && (
                        <View style={[styles.planBadge, { backgroundColor: cyan + '15', borderColor: cyan + '30' }]}>
                            <Icon name="crown-outline" size={14} color={cyan} style={{ marginRight: 6 }} />
                            <Text style={[styles.planText, { color: cyan }]}>
                                {settings.plan} Plan
                            </Text>
                            <Text style={[styles.planCredits, { color: textMuted }]}>
                                •  {settings.creditBalance ?? 0} credits remaining
                            </Text>
                        </View>
                    )}

                    {/* Sections */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {settings && renderModelSection(
                            'TEXT CHAT MODEL',
                            'LLM used for text conversations',
                            settings.availableChatModels,
                            'chatModel',
                            'chatModel',
                            null,
                            null
                        )}

                        {settings && renderModelSection(
                            'VOICE REASONING MODEL',
                            'LLM that processes your voice input',
                            settings.availableVoiceModels,
                            'voiceModel',
                            'voiceModel',
                            null,
                            'Upgrade to Pro Plus to access Voice Models.'
                        )}

                        {settings && renderModelSection(
                            'SPEECH OUTPUT (TTS)',
                            'Converts AI response to audio',
                            settings.availableTtsModels,
                            'ttsModel',
                            'ttsModel',
                            'TTS language is automatically detected from AI response text.',
                            'Upgrade to Pro Plus to access Text-to-Speech.'
                        )}

                        {settings && renderModelSection(
                            'SPEECH INPUT (STT)',
                            'Transcribes your voice input',
                            settings.availableSttModels,
                            'sttModel',
                            'sttModel',
                            null,
                            'Upgrade to Pro Plus to access Speech-to-Text.'
                        )}

                        {!settings && (
                            <View style={[styles.loadingFull, { borderColor }]}>
                                <ActivityIndicator color={cyan} />
                                <Text style={{ color: textMuted, marginTop: 12, fontSize: 14 }}>
                                    Loading settings...
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    container: {
        width: '85%',
        maxWidth: 380,
        height: '100%',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 12 },
        }),
    },
    header: {
        flexDirection: 'row', alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
    headerSub: { fontSize: 12, fontWeight: '500', marginTop: 3 },
    closeBtn: {
        width: 34, height: 34, borderRadius: 10, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    planBadge: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginTop: 12,
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 10, borderWidth: 1,
    },
    planText: { fontSize: 13, fontWeight: '700' },
    planCredits: { fontSize: 12, fontWeight: '500', marginLeft: 6 },
    scrollContent: { paddingBottom: 40 },
    section: {
        paddingHorizontal: 20, paddingVertical: 20,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 11, fontWeight: '800',
        letterSpacing: 1.5, marginBottom: 4,
    },
    sectionSubtitle: { fontSize: 12, fontWeight: '500', marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    modelCard: {
        borderWidth: 1, borderRadius: 12,
        paddingVertical: 10, paddingHorizontal: 12,
        minWidth: '45%', alignItems: 'flex-start',
    },
    selectedDot: {
        width: 6, height: 6, borderRadius: 3, marginBottom: 6,
    },
    modelName: { fontSize: 13, fontWeight: '600' },
    emptyContainer: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, borderWidth: 1,
        borderRadius: 12, borderStyle: 'dashed',
    },
    noteRow: {
        flexDirection: 'row', alignItems: 'flex-start',
        marginTop: 12, padding: 10,
        borderRadius: 10, borderWidth: 1,
    },
    noteText: { fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 17 },
    loadingFull: {
        margin: 20, padding: 32, borderRadius: 16,
        borderWidth: 1, borderStyle: 'dashed',
        alignItems: 'center',
    },
});
