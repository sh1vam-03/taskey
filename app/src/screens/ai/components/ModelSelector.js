import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';

const MODELS = [
    { id: 'gemini-2.0-flash',       name: 'Gemini 2.0 Flash',   icon: 'lightning-bolt',    tag: 'Fast'    },
    { id: 'gemini-2.5-flash',       name: 'Gemini 2.5 Flash',   icon: 'lightning-bolt',    tag: 'Latest'  },
    { id: 'gpt-4o',                 name: 'GPT-4o',             icon: 'brain',             tag: 'Smart'   },
    { id: 'gpt-4o-mini',            name: 'GPT-4o Mini',        icon: 'brain',             tag: 'Compact' },
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', icon: 'star-four-points', tag: 'Pro'    },
    { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku',  icon: 'star-four-points',  tag: 'Fast'    },
    { id: 'sarvam-m',               name: 'Sarvam M',           icon: 'translate',         tag: 'Indic'   },
];

export default function ModelSelector({ selectedModel, onSelect, onClose }) {
    const { theme, isDark } = useTheme();
    const cyan      = theme.cyan ?? '#00d4ff';
    const glassBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const glassBord = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
    const mutedText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

    return (
        <View style={[styles.container, {
            backgroundColor: isDark ? '#141414' : '#ffffff',
            borderTopColor: glassBord,
        }]}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: glassBord }]} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Select AI Model</Text>
                    <Text style={[styles.subtitle, { color: mutedText }]}>Choose the model for this conversation</Text>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeBtn, { backgroundColor: glassBg, borderColor: glassBord }]}
                >
                    <Icon name="close" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {MODELS.map(model => {
                    const isSelected = selectedModel === model.id;
                    return (
                        <TouchableOpacity
                            key={model.id}
                            style={[
                                styles.modelRow,
                                {
                                    backgroundColor: isSelected ? cyan + '15' : 'transparent',
                                    borderColor:     isSelected ? cyan + '40' : glassBord,
                                }
                            ]}
                            onPress={() => { onSelect(model.id); onClose?.(); }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.modelIconWrap, {
                                backgroundColor: isSelected ? cyan + '20' : glassBg,
                                borderColor:     isSelected ? cyan + '35' : glassBord,
                            }]}>
                                <Icon name={model.icon} size={18} color={isSelected ? cyan : mutedText} />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={[styles.modelName, { color: isSelected ? cyan : theme.text }]}>
                                    {model.name}
                                </Text>
                            </View>

                            <View style={[styles.tagChip, {
                                backgroundColor: isSelected ? cyan + '20' : glassBg,
                                borderColor:     isSelected ? cyan + '40' : glassBord,
                            }]}>
                                <Text style={[styles.tagText, { color: isSelected ? cyan : mutedText }]}>
                                    {model.tag}
                                </Text>
                            </View>

                            {isSelected && (
                                <Icon name="check-circle" size={18} color={cyan} style={{ marginLeft: 10 }} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        alignSelf: 'center', marginTop: 10, marginBottom: 16,
    },
    header: {
        flexDirection: 'row', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 16,
    },
    title:    { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    subtitle: { fontSize: 12, fontWeight: '500', marginTop: 3 },
    closeBtn: {
        width: 34, height: 34, borderRadius: 10, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    modelRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 14, borderWidth: 1,
        paddingHorizontal: 14, paddingVertical: 12,
        marginBottom: 8,
    },
    modelIconWrap: {
        width: 38, height: 38, borderRadius: 11, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    modelName: { fontSize: 14, fontWeight: '600' },
    tagChip: {
        borderRadius: 8, borderWidth: 1,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
