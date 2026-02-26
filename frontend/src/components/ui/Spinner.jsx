"use client";

/**
 * Spinner — themed loading indicator.
 *
 * Props:
 *   size      — "sm" | "md" | "lg"
 *   className — additional classes
 */
export default function Spinner({ size = "md", className = "" }) {
    const sizes = {
        sm: "w-4 h-4 border-[1.5px]",
        md: "w-7 h-7 border-2",
        lg: "w-11 h-11 border-[2.5px]",
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <div
                className={`${sizes[size]} rounded-full animate-spin
                            border-[var(--color-primary-border,rgba(6,182,212,0.18))]
                            border-t-[var(--color-primary,#06b6d4)]`}
                style={{
                    // Subtle glow on the spinning arc
                    filter: "drop-shadow(0 0 4px var(--color-primary-glow, rgba(6,182,212,0.25)))",
                }}
            />
            <span className="sr-only">Loading…</span>
        </div>
    );
}