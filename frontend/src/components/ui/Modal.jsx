'use client';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * Props:
 *   isOpen   — boolean
 *   onClose  — () => void
 *   title    — string
 *   size     — "sm" | "md" | "lg" | "xl"  (default: "md")
 *   children — ReactNode
 */
export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return createPortal(
        // ── Backdrop ──────────────────────────────────────────────────────────
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4
                       bg-black/70 backdrop-blur-sm
                       animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* ── Modal shell ─────────────────────────────────────────────── */}
            <div
                ref={modalRef}
                className={`w-full ${sizes[size] ?? sizes.md} animate-in zoom-in-95 duration-200`}
            >
                <Card variant="default" noPadding className="overflow-hidden">

                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="flex items-center justify-between
                                    px-6 py-4
                                    border-b border-white/[0.06]">
                        {/* Left — optional tag + title */}
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] opacity-60" />
                            <h2 className="text-sm font-semibold text-white tracking-tight">
                                {title}
                            </h2>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="text-white/20 hover:text-white/60
                                       transition-colors duration-150"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* ── Body ────────────────────────────────────────────── */}
                    <div className="px-6 py-5 text-sm text-white/40 font-mono leading-relaxed">
                        {children}
                    </div>

                </Card>
            </div>
        </div>,
        document.body
    );
}