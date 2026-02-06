import { FaMagic, FaCalendarAlt, FaCheckDouble, FaClock, FaBell, FaSync, FaMobileAlt, FaLayerGroup } from "react-icons/fa";
import { FaMicrophoneLines } from "react-icons/fa6";

export default function DetailedFeatures() {
    const features = [
        {
            id: "SYS.01",
            title: "Smart AI Scheduling",
            desc: "Time analysis & alloc automation.",
            icon: <FaMagic />,
            stat: "98% OPTIMAL",
            className: "md:col-span-2 md:row-span-2"
        },
        {
            id: "SYS.02",
            title: "Natural Input",
            desc: "Voice-to-Execution pipeline.",
            icon: <FaMicrophoneLines />,
            stat: "LATENCY < 50ms",
            className: "md:col-span-1"
        },
        {
            id: "SYS.03",
            title: "Prioritization",
            desc: "Deadline logic engines.",
            icon: <FaCheckDouble />,
            stat: "AUTO-RANK",
            className: "md:col-span-1"
        },
        {
            id: "SYS.04",
            title: "Sync Core",
            desc: "G-Cal / Outlook / Apple.",
            icon: <FaCalendarAlt />,
            stat: "REAL-TIME",
            className: "md:col-span-1"
        },
        {
            id: "SYS.05",
            title: "Time Boxing",
            desc: "Deep work encapsulation.",
            icon: <FaClock />,
            stat: "FOCUS MODE",
            className: "md:col-span-1"
        },
        {
            id: "SYS.06",
            title: "Context Aware",
            desc: "Dynamic interrupt handling.",
            icon: <FaBell />,
            stat: "ADAPTIVE",
            className: "md:col-span-2"
        },
        {
            id: "SYS.07",
            title: "Auto-Flow",
            desc: "Reschedule cascading.",
            icon: <FaLayerGroup />,
            stat: "INSTANT",
            className: "md:col-span-1"
        },
        {
            id: "SYS.08",
            title: "Omni-Channel",
            desc: "Web / Mobile / Desktop.",
            icon: <FaMobileAlt />,
            stat: "SYNCED",
            className: "md:col-span-1"
        }
    ];

    return (
        <section className="py-32 px-4 bg-black" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
                            System Capes
                        </h2>
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                            // Neural Architecture v1.0
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(200px,auto)] bg-white/5 border border-white/10 gap-px rounded-sm overflow-hidden">
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
