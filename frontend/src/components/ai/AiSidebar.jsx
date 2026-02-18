'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, Plus, MessageSquare, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAi } from '@/context/AiContext';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AiSidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { conversations, currentConv, setCurrentConv, createNewChat, deleteConversation, loading } = useAi();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const handleNewChat = async () => {
        await createNewChat();
        if (window.innerWidth < 768) setIsMobileOpen(false);
    };

    const confirmDeleteChat = (e, id) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
    };

    const handleDeleteChat = async () => {
        await deleteConversation(deleteModal.id);
        setDeleteModal({ isOpen: false, id: null });
    };

    const handleSelectChat = (c) => {
        setCurrentConv(c);
        if (window.innerWidth < 768) setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleMobile}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-black border border-white/10 rounded-md text-white"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/10 flex flex-col
                transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header / Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-white/5 gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold tracking-tight text-white">Taskey AI</span>
                </div>

                {/* New Chat Button */}
                <div className="p-4 pb-2">
                    <Button
                        onClick={handleNewChat}
                        variant="ghost"
                        className="w-full justify-start gap-3 border border-white/10 hover:bg-white/5 text-sm py-6 px-4 transition-colors rounded-xl group bg-white/5"
                    >
                        <div className="p-1.5 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors text-cyan-400">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="font-medium">New chat</span>
                    </Button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 px-4 py-2">History</div>

                    {loading && conversations.length === 0 ? (
                        <div className="space-y-2 px-2">
                            <div className="h-10 bg-white/5 rounded-lg w-full animate-pulse" />
                            <div className="h-10 bg-white/5 rounded-lg w-3/4 animate-pulse" />
                        </div>
                    ) : (
                        conversations.map(c => (
                            <div
                                key={c.id}
                                onClick={() => handleSelectChat(c)}
                                className={`
                                    group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-sm transition-all duration-200 relative
                                    ${currentConv?.id === c.id
                                        ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${currentConv?.id === c.id ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'}`} />
                                <span className="truncate flex-1 text-sm font-medium">{c.title || "New chat"}</span>

                                {currentConv?.id === c.id && (
                                    <div className="absolute right-2 flex items-center">
                                        <button
                                            onClick={(e) => confirmDeleteChat(e, c.id)}
                                            className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-md transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* User Info / Footer */}
                <div className="border-t border-white/5 p-4 m-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-900 to-black border border-cyan-500/20 flex items-center justify-center text-xs font-mono text-cyan-400">
                            AI
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">AI Assistant</span>
                            <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-wider">
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDeleteChat}
                title="Delete Chat"
                message="Remove this conversation from your history?"
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
