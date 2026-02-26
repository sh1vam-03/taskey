"use client";

/**
 * Toggle — themed switch input.
 *
 * Props:
 *   label     — string displayed beside the toggle
 *   checked   — boolean
 *   onChange  — (checked: boolean) => void
 *   disabled  — boolean
 *   hint      — optional subtle subtext below the label
 */
export default function Toggle({ label, checked, onChange, disabled = false, hint }) {
    return (
        <label
            className={`flex items-center justify-between gap-4 group
                        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {/* ── Label + hint ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-0.5 select-none">
                <span className="text-sm font-mono text-white/50
                                 group-hover:text-white/80
                                 transition-colors duration-200">
                    {label}
                </span>
                {hint && (
                    <span className="text-[11px] font-mono text-white/20 leading-snug">
                        {hint}
                    </span>
                )}
            </div>

            {/* ── Track + thumb ─────────────────────────────────────────── */}
            <div className="relative flex-shrink-0">
                {/* Hidden checkbox */}
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                />

                {/* Track */}
                <div
                    className={`w-9 h-5 rounded-sm border transition-all duration-200
                                ${checked
                            ? "bg-[var(--color-primary-muted,rgba(6,182,212,0.12))] border-[var(--color-primary-border,rgba(6,182,212,0.28))] shadow-[0_0_8px_var(--color-primary-glow,rgba(6,182,212,0.13))]"
                            : "bg-white/[0.04] border-white/[0.10] group-hover:border-white/20"
                        }`}
                />

                {/* Thumb */}
                <div
                    className={`absolute top-[3px] left-[3px]
                                w-[14px] h-[14px] rounded-sm
                                transition-all duration-200 ease-out
                                ${checked
                            ? "translate-x-4 bg-[var(--color-primary,#06b6d4)] shadow-[0_0_6px_var(--color-primary-glow,rgba(6,182,212,0.3))]"
                            : "translate-x-0 bg-white/30 group-hover:bg-white/50"
                        }`}
                />

                {/* Corner brackets — appear when checked */}
                <span className={`absolute top-0 left-0 w-1.5 h-1.5
                                  border-t border-l border-[var(--color-primary,#06b6d4)]
                                  transition-opacity duration-200
                                  ${checked ? "opacity-50" : "opacity-0"}`} />
                <span className={`absolute bottom-0 right-0 w-1.5 h-1.5
                                  border-b border-r border-[var(--color-primary,#06b6d4)]
                                  transition-opacity duration-200
                                  ${checked ? "opacity-50" : "opacity-0"}`} />
            </div>
        </label>
    );
}