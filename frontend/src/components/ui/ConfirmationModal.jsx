'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger | warning | info
    isLoading = false,
    children,
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    // ── Variant config ────────────────────────────────────────────────────────
    const variants = {
        danger: {
            icon: <AlertTriangle className="h-5 w-5" />,
            iconColor: "text-rose-400",
            iconBg: "bg-rose-500/10 border-rose-500/20",
            buttonVariant: "danger",
            accentColor: "rgba(244,63,94,0.12)",
        },
        warning: {
            icon: <AlertTriangle className="h-5 w-5" />,
            iconColor: "text-amber-400",
            iconBg: "bg-amber-500/10 border-amber-500/20",
            buttonVariant: "primary",   // primary = cyan, closest neutral "proceed" style
            accentColor: "rgba(245,158,11,0.10)",
        },
        info: {
            icon: <Info className="h-5 w-5" />,
            iconColor: "text-[var(--color-primary)]",
            iconBg: "bg-[var(--color-primary-muted)] border-[var(--color-primary-border)]",
            buttonVariant: "primary",
            accentColor: "var(--color-primary-muted)",
        },
    };

    const v = variants[variant] ?? variants.danger;

    return createPortal(
        // ── Backdrop ──────────────────────────────────────────────────────────
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4
                       bg-black/75 backdrop-blur-sm
                       animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
        >
            {/* ── Modal shell — reuses Card for consistent corner brackets + hover glow ── */}
            <div
                ref={modalRef}
                className="w-full max-w-md animate-in zoom-in-95 duration-200"
            >
                <Card variant="default" noPadding className="overflow-hidden">

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <div className="p-6">

                        {/* Close button */}
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-white/20 hover:text-white/60 transition-colors disabled:pointer-events-none"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            {/* Icon badge */}
                            <div className={`flex-shrink-0 flex items-center justify-center
                                            w-9 h-9 rounded-md border
                                            ${v.iconBg} ${v.iconColor}`}>
                                {v.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-white tracking-tight mb-1.5">
                                    {title}
                                </h3>
                                <div className="text-sm text-white/35 font-mono leading-relaxed">
                                    {message}
                                </div>
                                {children && (
                                    <div className="mt-4 text-sm text-white/35 font-mono">
                                        {children}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-3
                                    px-6 py-4
                                    border-t border-white/[0.06]
                                    bg-white/[0.02]">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>

                        <Button
                            variant={v.buttonVariant}
                            size="sm"
                            onClick={onConfirm}
                            disabled={isLoading}
                            isLoading={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>

                </Card>
            </div>
        </div>,
        document.body
    );
}