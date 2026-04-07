'use client';

const MODEL_DISPLAY = {
    'gemini-1.5-flash': { label: 'Gemini Flash', color: 'blue', icon: '⚡' },
    'sarvam-30b': { label: 'Sarvam 30B', color: 'purple', icon: '🇮🇳' },
    'gpt-4o-mini': { label: 'GPT-4o Mini', color: 'green', icon: '⭐' },
    'bulbul:v3': { label: 'Bulbul v3', color: 'orange', icon: '🔊' },
    'tts-1': { label: 'OpenAI TTS', color: 'green', icon: '🔊' },
    'saaras:v3': { label: 'Saaras v3', color: 'orange', icon: '🎤' },
    'whisper-1': { label: 'Whisper', color: 'green', icon: '🎤' },
};

const COLOR_CLASSES = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function ModelBadge({ model, onClick, className = '' }) {
    const info = MODEL_DISPLAY[model] || { label: model, color: 'blue', icon: '🤖' };
    const colors = COLOR_CLASSES[info.color] || COLOR_CLASSES.blue;

    return (
        <button
            onClick={onClick}
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider
                transition-all duration-200 cursor-pointer border whitespace-nowrap
                ${colors} ${onClick ? 'hover:opacity-80' : 'cursor-default'} ${className}
            `}
            title={model}
        >
            <span>{info.icon}</span>
            <span>{info.label}</span>
        </button>
    );
}

// Export for use in MessageBubble
export { MODEL_DISPLAY };
