'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

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
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="font-mono text-xs tracking-widest text-gray-500">INITIALIZING_AI_WORKSPACE...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#171717] z-50 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Go Back</span>
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="font-semibold tracking-tight text-sm">Taskey AI</span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">4.0 BETA</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono">
                        <Sparkles className="w-3 h-3 text-cyan-500" />
                        <span>AI_WORKSPACE_ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Content (Page) */}
            <div className="flex-1 flex overflow-hidden">
                {children}
            </div>
        </div>
    );
}
