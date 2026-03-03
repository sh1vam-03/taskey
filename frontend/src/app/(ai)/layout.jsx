'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { AiProvider } from '@/context/AiContext';
import { useAi } from '@/features/ai/useAi';
import AiSidebar from '@/components/ai/AiSidebar';
import AiSettingsPanel from '@/components/ai/AiSettingsPanel';
import CreditBadge from '@/components/ai/CreditBadge';
import { ArrowLeft, Settings, Menu } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function AiLayoutInner({ children }) {
    const router = useRouter();
    const params = useParams();
    const { success, error: toastError } = useToast();
    const { settings, isSettingsOpen, setIsSettingsOpen, openConversation, activeConversationId, isChatNotFound, clearError } = useAi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const lastIdRef = useRef(null); // Initialize to null to trigger sync on mount

    // Sync active conversation with URL
    useEffect(() => {
        const urlId = params.id;

        // 1. Handle URL changes (Manual navigation or back/forward)
        // Guard: Don't trigger if we are currently in an error state for this ID
        if (urlId !== lastIdRef.current && !isChatNotFound) {
            openConversation(urlId || null);
            lastIdRef.current = urlId;
            return;
        }

        // 2. Handle Context changes (New chat creation from /dashboard/ai)
        if (!urlId && activeConversationId) {
            // We are on the "New Chat" page, but a conversation was just created in context
            router.push(`/dashboard/ai/c/${activeConversationId}`);
            lastIdRef.current = activeConversationId;
        }
    }, [params.id, activeConversationId, openConversation, router]);

    // Handle Chat Not Found redirect + toast
    useEffect(() => {
        if (isChatNotFound) {
            toastError('Conversation not found');
            // We clear context error and redirect. 
            // The first effect will sync once the URL actually updates.
            router.replace('/dashboard/ai');
            clearError();
        }
    }, [isChatNotFound, toastError, clearError, router]);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <AiSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Top Header Bar */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-black/80 backdrop-blur-xl shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-white tracking-tight hidden sm:block">
                            Dashboard
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <CreditBadge balance={settings.creditBalance} plan={settings.plan} />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="AI Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 flex overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Settings Panel */}
            <AiSettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}

export default function AiLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <span className="font-mono text-xs tracking-widest text-gray-500">LOADING TASKTIME AI...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AiProvider>
            <AiLayoutInner>{children}</AiLayoutInner>
        </AiProvider>
    );
}
