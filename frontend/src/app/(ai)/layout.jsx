'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AiProvider } from '@/context/AiContext';
import { useAi } from '@/features/ai/useAi';
import AiSidebar from '@/components/ai/AiSidebar';
import AiSettingsPanel from '@/components/ai/AiSettingsPanel';
import CreditBadge from '@/components/ai/CreditBadge';
import { ArrowLeft, Settings, Menu } from 'lucide-react';

function AiLayoutInner({ children }) {
    const router = useRouter();
    const { settings, isSettingsOpen, setIsSettingsOpen } = useAi();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
            {/* Sidebar */}
            <AiSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Top Header Bar */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0d0d0d]/80 backdrop-blur-xl shrink-0 z-10">
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
                            Taskey AI
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
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0d] text-white">
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
