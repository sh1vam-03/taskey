'use client';

import { X, Check } from 'lucide-react';
import { useAi } from '@/features/ai/useAi';
import ProviderBadge from '@/components/ai/ProviderBadge';

export default function AiSettingsPanel({ isOpen, onClose }) {
    const { settings, updateSettings } = useAi();

    if (!isOpen) return null;

    const handleProviderChange = (provider) => {
        updateSettings({ provider });
    };

    const handleSttLangChange = (sttLang) => {
        updateSettings({ sttLang });
    };

    const handleSpeakerChange = (speaker) => {
        updateSettings({ speaker });
    };

    const isSarvam = settings.provider === 'sarvam';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/[0.06] z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-semibold text-white">AI Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* 1. AI Provider */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">AI Provider</h3>
                        <div className="space-y-2">
                            {(settings.availableProviders || []).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProviderChange(p.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${settings.provider === p.id
                                        ? 'border-cyan-500/30 bg-cyan-500/[0.06]'
                                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${settings.provider === p.id
                                                    ? 'border-cyan-400'
                                                    : 'border-gray-600'
                                                    }`}>
                                                    {settings.provider === p.id && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                    )}
                                                </span>
                                                <span className="text-sm font-medium text-white">{p.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 ml-5">{p.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {(settings.availableProviders || []).length === 0 && (
                                <div className="space-y-2">
                                    {[
                                        { id: 'openai', name: 'OpenAI (GPT-4o mini)', desc: 'Full tools, web search, tasks' },
                                        { id: 'sarvam', name: 'Sarvam AI (sarvam-m)', desc: 'Optimised for Indian languages. Full tool calling supported.' },
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleProviderChange(p.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${settings.provider === p.id
                                                ? 'border-cyan-500/30 bg-cyan-500/[0.06]'
                                                : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${settings.provider === p.id ? 'border-cyan-400' : 'border-gray-600'
                                                    }`}>
                                                    {settings.provider === p.id && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                    )}
                                                </span>
                                                <div>
                                                    <span className="text-sm font-medium text-white">{p.name}</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>


                    </section>

                    {/* 2. Voice Input Language (STT) */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                            Voice Input Language
                        </h3>
                        <select
                            value={settings.sttLang}
                            onChange={(e) => handleSttLangChange(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white
                                focus:outline-none focus:border-cyan-500/40 transition-colors cursor-pointer appearance-none"
                        >
                            <option value="unknown">Auto-detect</option>
                            {(settings.availableSttLangs || []).map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                            {(settings.availableSttLangs || []).length === 0 && (
                                <>
                                    <option value="en-IN">English</option>
                                    <option value="hi-IN">Hindi</option>
                                    <option value="mr-IN">Marathi</option>
                                    <option value="ta-IN">Tamil</option>
                                    <option value="te-IN">Telugu</option>
                                </>
                            )}
                        </select>
                        <p className="text-[10px] text-gray-600 mt-2 px-1">
                            Helps Saaras accurately transcribe your spoken input
                        </p>
                    </section>

                    {/* 3. TTS Speaker */}
                    <section className={isSarvam ? '' : 'opacity-40 pointer-events-none'}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                            TTS Voice / Speaker
                            {!isSarvam && <span className="text-gray-600 ml-2 normal-case">(Sarvam only)</span>}
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {(settings.availableSpeakers || []).map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSpeakerChange(s.id)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all duration-200 border ${settings.speaker === s.id
                                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30'
                                        : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                >
                                    <span className="block truncate">{s.label || s.id}</span>
                                    {s.gender && (
                                        <span className="block text-[9px] text-gray-600 mt-0.5">{s.gender}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 px-1">
                            TTS language is auto-detected from AI response text
                        </p>
                    </section>

                    {/* 4. Credits */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Credit Balance</h3>
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div>
                                <span className="text-2xl font-bold text-white">{settings.creditBalance || 0}</span>
                                <span className="text-xs text-gray-500 ml-2">credits remaining</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
