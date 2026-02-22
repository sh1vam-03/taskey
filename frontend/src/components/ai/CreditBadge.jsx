'use client';

import { Sparkles } from 'lucide-react';

export default function CreditBadge({ balance, plan }) {
    const numBalance = typeof balance === 'number' ? balance : 0;

    let colorClasses, label;
    if (numBalance < 10) {
        colorClasses = 'bg-red-500/10 text-red-400 border-red-500/20';
        label = 'Upgrade';
    } else if (numBalance <= 50) {
        colorClasses = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        label = 'Low';
    } else {
        colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        label = null;
    }

    return (
        <div
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider border
                ${colorClasses}
            `}
            title={`Credits: ${numBalance} | Plan: ${plan}`}
        >
            <Sparkles className="w-3 h-3" />
            <span>{numBalance}</span>
            {label && <span className="opacity-70">• {label}</span>}
        </div>
    );
}
