export default function SkeletonLoader({ type = "text", className = "" }) {
    const baseClass = "bg-zinc-800/50 animate-pulse rounded";

    if (type === "card") {
        return (
            <div className={`p-5 rounded-xl border border-white/5 bg-zinc-900/30 ${className}`}>
                <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-4 animate-pulse" />
                <div className="h-6 w-24 bg-zinc-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
            </div>
        );
    }

    if (type === "list") {
        return (
            <div className={`space-y-3 ${className}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-zinc-900/30 border border-white/5 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (type === "table-row") {
        return (
            <div className={`space-y-2 ${className}`}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 bg-zinc-900/10">
                        <div className="h-4 w-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-4 w-1/4 bg-zinc-800 rounded animate-pulse ml-auto" />
                        <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "calendar-grid") {
        return (
            <div className={`grid grid-cols-7 gap-px bg-zinc-800/20 border border-white/5 rounded-xl overflow-hidden ${className}`}>
                {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-24 bg-zinc-900/30 p-2 border-r border-b border-white/5">
                        <div className="h-4 w-4 bg-zinc-800 rounded animate-pulse mb-2" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "chat-sidebar") {
        return (
            <div className={`space-y-2 ${className}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 w-full bg-zinc-900/30 border border-white/5 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (type === "chat-messages") {
        return (
            <div className={`space-y-6 p-4 ${className}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        {/* User Bubble (Right) */}
                        <div className="flex justify-end">
                            <div className="h-12 w-2/3 bg-zinc-800/30 rounded-2xl rounded-tr-sm animate-pulse" />
                        </div>
                        {/* AI Bubble (Left) */}
                        <div className="flex justify-start">
                            <div className="h-24 w-3/4 bg-zinc-900/30 rounded-2xl rounded-tl-sm animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return <div className={`${baseClass} ${className}`} />;
}
