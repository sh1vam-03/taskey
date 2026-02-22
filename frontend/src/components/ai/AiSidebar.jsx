'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Trash2, Pencil, Check, X, MoreVertical, MessageSquare, ChevronLeft } from 'lucide-react';
import { useAi } from '@/features/ai/useAi';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ProviderBadge from '@/components/ai/ProviderBadge';
import CreditBadge from '@/components/ai/CreditBadge';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

export default function AiSidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const {
        conversations,
        activeConversationId,
        openConversation,
        createNewConversation,
        deleteConversation,
        renameConversation,
        isLoadingConversations,
        settings,
    } = useAi();

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);

    const handleNewChat = async () => {
        try {
            await createNewConversation();
            if (window.innerWidth < 768) onClose?.();
        } catch { /* handled in context */ }
    };

    const handleSelectChat = (conv) => {
        openConversation(conv.id);
        if (window.innerWidth < 768) onClose?.();
    };

    const startEditing = (e, conv) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditTitle(conv.title || 'New chat');
        setActiveMenuId(null);
    };

    const saveEditing = async (e) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            await renameConversation(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle('');
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingId(null);
        setEditTitle('');
    };

    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
        setActiveMenuId(null);
    };

    const handleDelete = async () => {
        await deleteConversation(deleteModal.id);
        setDeleteModal({ isOpen: false, id: null });
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col
                transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <MessageSquare className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white tracking-tight">Taskey AI</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-3 pt-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                            text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]
                            border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
                    >
                        <Plus className="w-4 h-4 text-cyan-400" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-thumb-white/10">
                    <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-gray-600 mb-2">
                        History
                    </p>
                    <div className="space-y-0.5">
                        {isLoadingConversations && conversations.length === 0 ? (
                            <SkeletonLoader type="chat-sidebar" />
                        ) : conversations.length === 0 ? (
                            <p className="text-xs text-gray-600 px-2 py-4 text-center">
                                No conversations yet
                            </p>
                        ) : (
                            conversations.map(c => {
                                const isActive = activeConversationId === c.id;
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelectChat(c)}
                                        className={`
                                            relative group flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer
                                            transition-all duration-150
                                            ${isActive
                                                ? 'bg-white/[0.08] text-white'
                                                : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        {editingId === c.id ? (
                                            <div className="flex items-center w-full gap-1.5" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEditing(e);
                                                        if (e.key === 'Escape') cancelEditing(e);
                                                    }}
                                                    autoFocus
                                                    className="flex-1 bg-black border border-white/20 rounded-md px-2 py-1 text-white text-xs
                                                        focus:outline-none focus:border-cyan-500/50 transition-colors"
                                                />
                                                <button onClick={saveEditing} className="p-1 text-cyan-400 hover:text-cyan-300">
                                                    <Check size={13} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-1 text-gray-500 hover:text-gray-300">
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-[13px]">{c.title || 'New chat'}</p>
                                                    <p className="text-[10px] text-gray-600 mt-0.5">
                                                        {formatTime(c.updatedAt || c.createdAt)}
                                                    </p>
                                                </div>
                                                <div className={`flex items-center shrink-0 ${activeMenuId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                                    <button
                                                        onClick={(e) => toggleMenu(e, c.id)}
                                                        className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>

                                                    {activeMenuId === c.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                                            <div className="absolute right-0 top-8 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                                                                <button
                                                                    onClick={(e) => startEditing(e, c)}
                                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2"
                                                                >
                                                                    <Pencil size={11} /> Rename
                                                                </button>
                                                                <button
                                                                    onClick={(e) => confirmDelete(e, c.id)}
                                                                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={11} /> Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer: Provider + Credits + User */}
                <div className="border-t border-white/[0.06] p-3 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <ProviderBadge provider={settings.provider} />
                        <CreditBadge balance={settings.creditBalance} plan={settings.plan} />
                    </div>

                    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-white/[0.03]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-[10px] font-mono text-white shrink-0">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-gray-200 truncate">{user?.name}</span>
                            <span className="text-[9px] text-cyan-500/80 font-mono uppercase tracking-wider">
                                {settings.plan || 'FREE'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Chat"
                message="Remove this conversation from your history?"
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}
