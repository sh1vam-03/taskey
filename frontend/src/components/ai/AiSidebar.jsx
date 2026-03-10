'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Trash2, Pencil, Check, X, MoreVertical, MessageSquare, ChevronLeft, LogOut, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAi } from '@/features/ai/useAi';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ModelBadge from '@/components/ai/ModelBadge';
import CreditBadge from '@/components/ai/CreditBadge';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

export default function AiSidebar({ isOpen, onClose }) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const {
        conversations,
        activeConversationId,
        openConversation,
        createNewConversation,
        deleteConversation,
        renameConversation,
        isLoadingConversations,
        settings,
        setIsSettingsOpen,
    } = useAi();

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    // Determine if user has voice models (Pro Plus)
    const hasVoice = settings.availableVoiceModels?.length > 0;

    const handleNewChat = () => {
        router.push('/dashboard/ai');
        if (window.innerWidth < 768) onClose?.();
    };

    const handleSelectChat = (conv) => {
        router.push(`/dashboard/ai/c/${conv.id}`);
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

    const openSettings = () => {
        setIsSettingsOpen(true);
    };

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/10 flex flex-col
                transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                            TASKTIME AI
                        </span>
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            vALPHA
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden ml-auto p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-3 pt-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                            text-gray-300 hover:text-white bg-white/4 hover:bg-white/8
                            border border-white/6 hover:border-white/12 transition-all duration-200"
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
                                                ? 'bg-white/8 text-white'
                                                : 'text-gray-400 hover:bg-white/4 hover:text-gray-200'
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
                                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/6 hover:text-white flex items-center gap-2"
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

                {/* Footer: Model Badges + Credits + User */}
                <div className="border-t border-white/10 pt-4">
                    {/* Model Quick-Info Area */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-3 mx-4 mb-4">
                        {/* Section Label */}
                        <div className="px-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                            <span>AI Model Status</span>
                            <div className="h-px w-12 bg-linear-to-r from-gray-500/50 to-transparent"></div>
                        </div>

                        {/* Text Chat Row */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] text-gray-300 font-medium flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Text Chat
                            </span>
                            <ModelBadge model={settings.chatModel} onClick={openSettings} />
                        </div>

                        {/* Voice Mode Collapsible (Only for Pro+) */}
                        {hasVoice && (
                            <div className="bg-black/40 rounded-lg border border-white/5 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setIsVoiceOpen(!isVoiceOpen)}
                                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-[11px] text-gray-300 font-medium flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-orange-400" /> Voice Engine
                                    </span>
                                    {isVoiceOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                                    )}
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isVoiceOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-2 pt-0 pb-2 space-y-2.5">
                                        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-1"></div>
                                        <div className="flex items-center justify-between px-1 border-l-2 border-transparent hover:border-white/10 pl-2 ml-1 transition-all">
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide">Reasoning</span>
                                            <ModelBadge model={settings.voiceModel} onClick={openSettings} />
                                        </div>
                                        <div className="flex items-center justify-between px-1 border-l-2 border-transparent hover:border-white/10 pl-2 ml-1 transition-all">
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide">Speech Output</span>
                                            <ModelBadge model={settings.ttsModel} onClick={openSettings} />
                                        </div>
                                        <div className="flex items-center justify-between px-1 border-l-2 border-transparent hover:border-white/10 pl-2 ml-1 transition-all">
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide">Speech Input</span>
                                            <ModelBadge model={settings.sttModel} onClick={openSettings} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    <div className="border-t border-white/5 p-4 m-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xs font-mono text-white shrink-0">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex flex-col overflow-hidden min-w-0">
                                <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                                <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-wider">
                                    {user?.plan === 'PRO_PLUS' ? 'PRO PLUS' : user?.plan === 'PRO' ? 'PRO' : 'FREE'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            LOGOUT
                        </button>
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
