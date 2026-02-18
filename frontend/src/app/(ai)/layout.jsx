'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AiProvider } from '@/context/AiContext';
import AiSidebar from '@/components/ai/AiSidebar';

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
        <AiProvider>
            <div className="flex h-screen bg-black text-white overflow-hidden">
                <AiSidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative bg-[#121212]">
                    {/* Main Content (Page) */}
                    <div className="flex-1 flex overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </AiProvider>
    );
}
