'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger | warning | info
    isLoading = false
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

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
            button: "bg-red-500 hover:bg-red-600 text-white",
            border: "border-red-500/20"
        },
        warning: {
            icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
            button: "bg-yellow-500 hover:bg-yellow-600 text-black",
            border: "border-yellow-500/20"
        },
        info: {
            icon: <AlertTriangle className="h-6 w-6 text-blue-500" />,
            button: "bg-blue-500 hover:bg-blue-600 text-white",
            border: "border-blue-500/20"
        }
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={`w-full max-w-md bg-zinc-900 border ${styles.border} rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden`}
                ref={modalRef}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 p-3 bg-white/5 rounded-full">
                            {styles.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {title}
                            </h3>
                            <div className="text-gray-400 text-sm leading-relaxed">
                                {message}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-4 flex items-center justify-end gap-3 border-t border-white/5">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLoading && <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
