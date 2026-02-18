'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, Plus, MessageSquare, Trash2, ArrowLeft, Pencil, Check, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAi } from '@/context/AiContext';
import { useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

export default function AiSidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { conversations, currentConv, setCurrentConv, createNewChat, deleteConversation, renameChat, loading } = useAi();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [activeMenuId, setActiveMenuId] = useState(null);

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const handleNewChat = () => {
        setCurrentConv(null);
        if (window.innerWidth < 768) setIsMobileOpen(false);
    };

    const confirmDeleteChat = (e, id) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id });
        setActiveMenuId(null); // Close menu
    };

    const startEditing = (e, conv) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditTitle(conv.title || "New chat");
        setActiveMenuId(null); // Close menu
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const saveEditing = async (e) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            await renameChat(editingId, editTitle);
        }
        setEditingId(null);
        setEditTitle("");
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingId(null);
        setEditTitle("");
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
                <div className="h-20 flex items-center px-8 border-b border-white/5 gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 -ml-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600" />
                        <span className="text-lg font-bold tracking-tight text-white">
                            Taskey AI
                        </span>
                    </Link>
                </div>

                {/* Nav / History List */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    <div>
                        <h3 className="px-4 text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                            Actions
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={handleNewChat}
                                className={`
                                    w-full relative group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    text-gray-400 hover:text-white hover:bg-white/5
                                `}
                            >
                                <Plus className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                                <span className="font-sans tracking-wide">New Chat</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="px-4 text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                            History
                        </h3>
                        <div className="space-y-1">
                            {loading && conversations.length === 0 ? (
                                <SkeletonLoader type="chat-sidebar" />
                            ) : (
                                conversations.map(c => {
                                    const isActive = currentConv?.id === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() => handleSelectChat(c)}
                                            className={`
                                                relative group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-pointer
                                                ${isActive
                                                    ? 'bg-[#212121] text-white'
                                                    : 'text-gray-400 hover:bg-[#212121]/50 hover:text-white'
                                                }
                                            `}
                                        >
                                            {editingId === c.id ? (
                                                <div className="flex items-center w-full gap-2" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEditing(e);
                                                            if (e.key === 'Escape') cancelEditing(e);
                                                        }}
                                                        autoFocus
                                                        className="flex-1 bg-black border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                                                    />
                                                    <button onClick={saveEditing} className="text-white hover:text-white/50"><Check size={14} /></button>
                                                    <button onClick={cancelEditing} className="text-white hover:text-white/50"><X size={14} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="truncate flex-1 font-sans text-sm">{c.title || "New chat"}</span>

                                                    {/* Menu Trigger */}
                                                    <div className={`absolute right-2 flex items-center ${activeMenuId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                                        <button
                                                            onClick={(e) => toggleMenu(e, c.id)}
                                                            className="p-1.5 hover:bg-black rounded-md text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {activeMenuId === c.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />

                                                                <div className="absolute right-0 top-6 w-32 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                    <button
                                                                        onClick={(e) => startEditing(e, c)}
                                                                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                                                    >
                                                                        <Pencil size={12} />
                                                                        Rename
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => confirmDeleteChat(e, c.id)}
                                                                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                        Delete
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
                </div>

                {/* User Info (Copied from Dashboard Sidebar) */}
                <div className="border-t border-white/5 p-4 m-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xs font-mono text-white">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                            <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-wider">
                                {user?.plan === 'pro' ? 'PRO_ACCESS' : 'FREE_TIER'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Disconnect
                    </button>
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
