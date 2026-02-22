'use client';

export default function ProviderBadge({ provider, onClick }) {
    const isOpenAI = provider === 'openai';

    return (
        <button
            onClick={onClick}
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                transition-all duration-200 cursor-pointer border
                ${isOpenAI
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                }
            `}
            title={`Provider: ${isOpenAI ? 'OpenAI' : 'Sarvam AI'}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpenAI ? 'bg-blue-400' : 'bg-orange-400'}`} />
            {isOpenAI ? 'OpenAI' : 'Sarvam'}
        </button>
    );
}
