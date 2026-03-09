import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';

const MODELS = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku" },
    { id: "sarvam-m", name: "Sarvam M (Indic)" }
];

export default function ModelSelector({ selectedModel, onSelect, onClose }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Select AI Model</Text>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="x" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {MODELS.map(model => (
                <TouchableOpacity
                    key={model.id}
                    style={[
                        styles.modelItem,
                        { borderBottomColor: theme.border },
                        selectedModel === model.id && { backgroundColor: theme.cyanDim, paddingHorizontal: 8, borderRadius: 8, borderBottomWidth: 0 }
                    ]}
                    onPress={() => onSelect(model.id)}
                >
                    <Text style={[
                        styles.modelText,
                        { color: theme.text },
                        selectedModel === model.id && { color: theme.cyan, fontWeight: 'bold' }
                    ]}>
                        {model.name}
                    </Text>
                    {selectedModel === model.id && (
                        <Icon name="check" size={20} color={theme.cyan} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: typography.fontSizes.lg,
        fontWeight: 'bold',
    },
    modelItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modelText: {
        fontSize: typography.fontSizes.md,
    },
});
