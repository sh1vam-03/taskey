'use client';

import { useContext, useMemo } from 'react';
import { AiContext } from '@/context/AiContext';

/**
 * Primary hook — thin wrapper over context.
 */
export const useAi = () => {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error('useAi must be used within AiProvider');
    return ctx;
};

/**
 * Returns the active conversation object.
 */
export const useActiveConversation = () => {
    const { conversations, activeConversationId } = useAi();
    return useMemo(
        () => conversations.find(c => c.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );
};

/**
 * Returns settings + update function.
 */
export const useAiSettings = () => {
    const { settings, updateSettings, isLoadingSettings } = useAi();
    return { settings, updateSettings, isLoadingSettings };
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

/**
 * Returns credit balance + derived flags.
 */
export const useCredits = () => {
    const { settings: { creditBalance, plan } } = useAi();
    const isLow = creditBalance <= 50 && creditBalance > 10;
    const isUrgent = creditBalance <= 10;
    return { creditBalance, plan, isLow, isUrgent };
};
