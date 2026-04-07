'use client';

import { X } from 'lucide-react';
import { useAi } from '@/features/ai/useAi';
import ModelCard from '@/components/ai/ModelCard';

export default function AiSettingsPanel({ isOpen, onClose }) {
    const { settings, updateSettings, isLoadingSettings } = useAi();

    if (!isOpen) return null;

    const handleModelSelect = async (field, value) => {
        await updateSettings({ [field]: value });
    };

    const handleSttLangChange = (sttLang) => {
        updateSettings({ sttLang });
    };

    const handleSpeakerChange = (speaker) => {
        updateSettings({ speaker });
    };

    const isBulbul = settings.ttsModel === 'bulbul:v3';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/[0.06] z-50 flex flex-col overflow-hidden">
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

                    {/* 1. Text Chat Model */}
                    <ModelSection
                        title="Text Chat Model"
                        subtitle="LLM used for text conversations"
                        models={settings.availableChatModels}
                        selected={settings.chatModel}
                        onSelect={(id) => handleModelSelect('chatModel', id)}
                    />

                    {/* 2. Voice Thinking Model */}
                    <ModelSection
                        title="Voice Reasoning Model"
                        subtitle="LLM that processes your voice input"
                        models={settings.availableVoiceModels}
                        selected={settings.voiceModel}
                        onSelect={(id) => handleModelSelect('voiceModel', id)}
                        isLoading={isLoadingSettings}
                        emptyMessage="Upgrade to Pro Plus to access Voice Models."
                    />

                    {/* 3. Text-to-Speech (TTS) */}
                    <ModelSection
                        title="Speech Output (TTS)"
                        subtitle="Converts AI response to audio"
                        models={settings.availableTtsModels}
                        selected={settings.ttsModel}
                        onSelect={(id) => handleModelSelect('ttsModel', id)}
                        note="TTS language is automatically detected from AI response text."
                        isLoading={isLoadingSettings}
                        emptyMessage="Upgrade to Pro Plus to access Text-to-Speech."
                    />

                    {/* 4. Speech-to-Text (STT) */}
                    <ModelSection
                        title="Speech Input (STT)"
                        subtitle="Transcribes your voice input"
                        models={settings.availableSttModels}
                        selected={settings.sttModel}
                        onSelect={(id) => handleModelSelect('sttModel', id)}
                        isLoading={isLoadingSettings}
                        emptyMessage="Upgrade to Pro Plus to access Speech-to-Text."
                    />

                    {/* 5. Voice Input Language (STT hint) */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            Voice Input Language
                        </h3>
                        <p className="text-[10px] text-gray-600 mb-3">Helps improve transcription accuracy</p>
                        <select
                            value={settings.sttLang}
                            onChange={(e) => handleSttLangChange(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white
                                focus:outline-none focus:border-cyan-500/40 transition-colors cursor-pointer appearance-none"
                        >
                            {(settings.availableSttLangs || []).map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                            {(settings.availableSttLangs || []).length === 0 && (
                                <>
                                    <option value="unknown">Auto-detect (default)</option>
                                    <option value="en-IN">English</option>
                                    <option value="hi-IN">Hindi</option>
                                    <option value="mr-IN">Marathi</option>
                                    <option value="ta-IN">Tamil</option>
                                    <option value="te-IN">Telugu</option>
                                </>
                            )}
                        </select>
                    </section>

                    {/* 6. Speaker Voice (Bulbul v3 only) */}
                    <section className={isBulbul ? '' : 'opacity-30 pointer-events-none'}>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            Speaker Voice
                            {!isBulbul && <span className="text-gray-600 ml-2 normal-case">(Bulbul v3 only)</span>}
                        </h3>
                        <p className="text-[10px] text-gray-600 mb-3">Choose a voice for audio responses</p>

                        {(settings.availableSpeakers || []).length > 0 ? (
                            <div className="space-y-2">
                                {/* Group by gender */}
                                {['M', 'F'].map(gender => {
                                    const speakers = (settings.availableSpeakers || []).filter(s => s.gender === gender);
                                    if (speakers.length === 0) return null;
                                    return (
                                        <div key={gender}>
                                            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">
                                                {gender === 'M' ? 'Male' : 'Female'}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {speakers.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => handleSpeakerChange(s.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${settings.speaker === s.id
                                                            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30'
                                                            : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                                                            }`}
                                                    >
                                                        {s.label || s.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Fallback speaker grid */
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Male</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['shubh', 'amit', 'sumit', 'manan', 'rahul', 'ratan'].map(id => (
                                            <button
                                                key={id}
                                                onClick={() => handleSpeakerChange(id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 border ${settings.speaker === id
                                                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                                                    : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.06]'
                                                    }`}
                                            >
                                                {id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Female</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['ritu', 'pooja', 'simran', 'kavya', 'priya', 'ishita', 'shreya', 'shruti'].map(id => (
                                            <button
                                                key={id}
                                                onClick={() => handleSpeakerChange(id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 border ${settings.speaker === id
                                                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                                                    : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.06]'
                                                    }`}
                                            >
                                                {id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 7. Credits & Plan */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Credits & Plan</h3>
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div>
                                <span className="text-2xl font-bold text-white">{settings.creditBalance || 0}</span>
                                <span className="text-xs text-gray-500 ml-2">credits</span>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06] font-mono uppercase">
                                {settings.plan || 'FREE'}
                            </span>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

/**
 * Reusable model selection section within the settings panel.
 */
function ModelSection({ title, subtitle, models = [], selected, onSelect, note, emptyMessage, isLoading }) {
    return (
        <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-600 mb-3">{subtitle}</p>}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="rounded-xl border border-white/4 bg-white/2 p-4 text-center">
                        <p className="text-xs text-gray-500">Loading models...</p>
                    </div>
                ) : models.length > 0 ? (
                    (() => {
                        // Check if these are chat/voice models (they have supportsTools property)
                        // STT/TTS models won't have this, so they just render normally
                        const hasToolsFlag = models.some(m => m.supportsTools !== undefined);

                        if (!hasToolsFlag) {
                            return models.map(m => (
                                <ModelCard
                                    key={m.id}
                                    model={m}
                                    isSelected={selected === m.id}
                                    onSelect={onSelect}
                                />
                            ));
                        }

                        // Group models by provider for a cleaner look
                        const providers = [
                            { name: 'Sarvam AI (Indic)', match: (m) => m.id.includes('sarvam') },
                            { name: 'Google Gemini', match: (m) => m.id.includes('gemini') },
                            { name: 'OpenAI GPT', match: (m) => m.id.includes('gpt') },
                        ];

                        return (
                            <div className="space-y-4">
                                {providers.map(p => {
                                    const providerModels = models.filter(p.match);
                                    if (providerModels.length === 0) return null;
                                    return (
                                        <div key={p.name} className="space-y-2">
                                            <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-widest px-1">{p.name}</h4>
                                            {providerModels.map(m => (
                                                <ModelCard
                                                    key={m.id}
                                                    model={m}
                                                    isSelected={selected === m.id}
                                                    onSelect={onSelect}
                                                />
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()
                ) : (
                    <div className="rounded-xl border border-white/4 bg-white/2 p-4 flex items-center justify-center gap-2 text-gray-400">
                        <span className="text-xs">🔒 {emptyMessage || "Not available on current plan"}</span>
                    </div>
                )}
            </div>
            {note && (
                <p className="text-[10px] text-gray-600 mt-2 px-1">ℹ️ {note}</p>
            )}
        </section>
    );
}
