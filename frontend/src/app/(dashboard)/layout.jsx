'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
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
                    <span className="font-mono text-xs tracking-widest text-gray-500">INITIALIZING_SYSTEM...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-500 overflow-hidden">
            <UpgradeModal />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
                {/* Mobile header removed, handled by Sidebar */}
                <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
