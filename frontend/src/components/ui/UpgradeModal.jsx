'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Zap, X, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const PERKS = [
    "Unlimited tasks & schedules",
    "Full AI assistant access",
    "Real-time web data",
    "Voice interaction (STT + TTS)",
];

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
        return () => window.removeEventListener('taskey-limit-reached', handleLimitReached);
    }, []);

    if (!isOpen) return null;

    const handleUpgrade = () => {
        setIsOpen(false);
        router.push('/dashboard/billing');
    };

    return createPortal(
        // ── Backdrop ──────────────────────────────────────────────────────────
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4
                       bg-black/75 backdrop-blur-sm
                       animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
            <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
                <Card variant="default" noPadding className="overflow-hidden">

                    {/* ── Header bar ──────────────────────────────────────── */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">
                                Plan Limit Reached
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                            className="text-white/20 hover:text-white/60 transition-colors duration-150"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ── Body ────────────────────────────────────────────── */}
                    <div className="px-6 py-6 flex flex-col items-center text-center">

                        {/* Icon badge */}
                        <div className="flex items-center justify-center
                                        w-12 h-12 rounded-md mb-5
                                        bg-amber-500/10 border border-amber-500/20
                                        text-amber-400">
                            <Lock className="w-5 h-5" />
                        </div>

                        {/* Heading */}
                        <h2 className="text-lg font-semibold text-white tracking-tight mb-2">
                            Unlock Full Access
                        </h2>
                        <p className="text-sm font-mono text-white/30 leading-relaxed mb-6">
                            {message}
                        </p>

                        {/* Perks list */}
                        <div className="w-full text-left space-y-2 mb-6
                                        bg-[var(--color-primary-muted)] border border-[var(--color-primary-border)]
                                        rounded-[4px] px-4 py-3">
                            {PERKS.map((perk) => (
                                <div key={perk} className="flex items-center gap-2.5 text-[12px] font-mono text-white/50">
                                    <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-70 flex-shrink-0" />
                                    {perk}
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col w-full gap-2">
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={handleUpgrade}
                                leftIcon={<Zap className="w-3.5 h-3.5" />}
                            >
                                Upgrade to Pro
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Maybe later
                            </Button>
                        </div>

                    </div>
                </Card>
            </div>
        </div>,
        document.body
    );
}