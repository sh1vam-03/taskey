export default function SkeletonLoader({ type = "text", className = "" }) {
    const baseClass = "bg-zinc-800/50 animate-pulse rounded";

    if (type === "card") {
        return (
            <div className={`p-5 rounded-xl border border-white/5 bg-zinc-900/30 ${className}`}>
                <div className="h-8 w-8 bg-zinc-800 rounded-lg mb-4" />
                <div className="h-6 w-24 bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-16 bg-zinc-800 rounded" />
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

    return <div className={`${baseClass} ${className}`} />;
}
