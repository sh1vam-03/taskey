'use client';

import { useContext, useMemo } from 'react';
import { AiContext } from '@/context/AiContext';

/**
 * Main hook — returns all AI context values.
 * Components should use useAi() instead of useContext(AiContext) directly.
 */
export const useAi = () => {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error('useAi must be used within AiProvider');
    return ctx;
};

/**
 * Returns the active conversation object (from the conversations list).
 */
export const useActiveConversation = () => {
    const { conversations, activeConversationId } = useAi();
    return useMemo(
        () => conversations.find(c => c.id === activeConversationId) || null,
        [conversations, activeConversationId]
    );
};

/**
 * Returns settings + updateSettings for components that only need settings.
 */
export const useAiSettings = () => {
    const { settings, updateSettings, loadSettings } = useAi();
    return { settings, updateSettings, loadSettings };
};

/**
 * Returns voice-specific state and actions.
 */
export const useVoice = () => {
    const {
        isRecording,
        setIsRecording,
        isProcessingVoice,
        voiceResponse,
        clearVoiceResponse,
        sendVoiceMessage,
    } = useAi();

    return {
        isRecording,
        setIsRecording,
        isProcessingVoice,
        voiceResponse,
        clearVoiceResponse,
        sendVoiceMessage,
    };
};
