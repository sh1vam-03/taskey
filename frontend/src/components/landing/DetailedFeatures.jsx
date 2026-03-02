import { FaMagic, FaCalendarAlt, FaCheckDouble, FaClock, FaBell, FaSync, FaMobileAlt, FaLayerGroup } from "react-icons/fa";
import { FaMicrophoneLines } from "react-icons/fa6";

export default function DetailedFeatures() {
    const features = [
        {
            id: "AI",
            title: "Talk to Your Tasks",
            desc: "Simply type or speak to manage your day. Our AI understands exactly what you mean—whether you're adding a new goal, changing a deadline, or setting priorities from Low to High. No buttons needed.",
            icon: <FaMagic />,
            stat: "", // 98% OPTIMAL
            className: "md:col-span-2 md:row-span-2"
        },
        {
            id: "VOICE",
            title: "Human-like Voice",
            desc: "Choose from many voices powered by OpenAI Whisper/TTS and Sarvam Saaras/Bulbul.",
            icon: <FaMicrophoneLines />,
            stat: "", // LATENCY < 50ms
            className: "md:col-span-1"
        },
        {
            id: "STATS",
            title: "Personal Scores",
            desc: "Get a simple score that shows how well you followed your plan.",
            icon: <FaCheckDouble />,
            stat: "", // AUTO-RANK
            className: "md:col-span-1"
        },
        {
            id: "CALENDAR",
            title: "Get your personal calendar",
            desc: "View and manage your tasks in a beautiful, intuitive calendar interface.",
            icon: <FaCalendarAlt />,
            stat: "", // REAL-TIME
            className: "md:col-span-1"
        },
        {
            id: "FOCUS",
            title: "Daily Goals",
            desc: "Try to complete everything you planned and build a winning streak.",
            icon: <FaClock />,
            stat: "", // FOCUS MODE
            className: "md:col-span-1"
        },
        {
            id: "SMART",
            title: "Smart Suggestions",
            desc: "If your day changes, just ask the AI to suggests a new schedule in seconds.",
            icon: <FaBell />,
            stat: "", // ADAPTIVE
            className: "md:col-span-2"
        },
        {
            id: "FLOW",
            title: "Quick Plan Updates",
            desc: "If things change, just ask the AI to reorganize your day in seconds.",
            icon: <FaLayerGroup />,
            stat: "", // INSTANT
            className: "md:col-span-1"
        },
        {
            id: "ACCESS",
            title: "Access Anywhere",
            desc: "Use TASKTIME on web, mobile, or desktop with real-time updates.",
            icon: <FaMobileAlt />,
            stat: "", // SYNCED
            className: "md:col-span-1"
        }
    ];
    const CONTAINER_CLASS = "w-full max-w-[var(--container-width)] mx-auto px-[var(--container-padding)]";

    return (
        <section className={`py-[var(--section-spacing)] ${CONTAINER_CLASS}`} id="features">
            <div className="w-full max-w-[var(--container-width)] mx-auto">
                <div className="mb-10 md:mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
                            Powerful Features That Work For You
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            Everything you need to manage tasks and schedules intelligently.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[minmax(200px,auto)] bg-white/5 border border-white/10 gap-px rounded-sm overflow-hidden">
                    {features.map((feat, i) => (
                        <div key={i} className={`p-8 bg-black hover:bg-neutral-900/30 transition-colors duration-300 flex flex-col justify-between group relative ${feat.className || ""}`}>

                            {/* Tech Decorators (Corner +) */}
                            <div className="absolute top-2 left-2 text-[10px] text-white/20 font-mono">+</div>
                            <div className="absolute top-2 right-2 text-[10px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 left-2 text-[10px] text-white/20 font-mono">+</div>
                            <div className="absolute bottom-2 right-2 text-[10px] text-white/20 font-mono">+</div>

                            <div className="flex justify-between items-start">
                                <div className="text-2xl text-white group-hover:text-cyan-500 transition-colors">
                                    {feat.icon}
                                </div>
                                <span className="font-mono text-[10px] text-gray-700 group-hover:text-cyan-500 transition-colors uppercase border border-white/5 px-2 py-0.5 rounded-full">
                                    {feat.id}
                                </span>
                            </div>

                            <div className="mt-8">
                                <h3 className={`font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-none tracking-tight ${feat.className?.includes('col-span-2') ? 'text-3xl' : 'text-xl'}`}>
                                    {feat.title}
                                </h3>
                                <div className="h-px w-8 bg-white/20 my-3 group-hover:w-full group-hover:bg-cyan-500/50 transition-all duration-500" />
                                <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors font-mono">
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
