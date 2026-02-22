'use client';

import { Check } from 'lucide-react';

/**
 * Selectable model card with name, provider, description, badge, and pricing.
 * Used in AiSettingsPanel for each of the 4 model selectors.
 */
export default function ModelCard({ model, isSelected, onSelect }) {
    if (!model) return null;

    return (
        <button
            onClick={() => onSelect(model.id)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ${isSelected
                    ? 'border-cyan-500/30 bg-cyan-500/[0.06] ring-1 ring-cyan-500/20'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{model.name}</span>
                        <span className="text-[10px] text-gray-500">({model.provider})</span>
                        {model.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                                {model.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{model.description}</p>
                    {model.pricing && (
                        <p className="text-[10px] text-gray-600 mt-1.5 font-mono">
                            {model.pricing.label}
                        </p>
                    )}
                </div>

                {isSelected && (
                    <div className="shrink-0 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                    </div>
                )}
            </div>
        </button>
    );
}
