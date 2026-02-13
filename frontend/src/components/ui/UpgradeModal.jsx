'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, X, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UpgradeModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleLimitReached = (event) => {
            setMessage(event.detail || "You've reached the limit for your current plan.");
            setIsOpen(true);
        };

        window.addEventListener('taskey-limit-reached', handleLimitReached);

        return () => {
            window.removeEventListener('taskey-limit-reached', handleLimitReached);
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
                        <Lock className="w-8 h-8 text-yellow-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Limit Reached</h2>
                    <p className="text-gray-400 mb-8">{message}</p>

                    <div className="flex flex-col w-full gap-3">
                        <Button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/dashboard/billing');
                            }}
                            className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            UPGRADE TO UNLIMITED
                        </Button>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
