import { FaMagic, FaCalendarAlt, FaCheckDouble, FaClock, FaBell, FaSync, FaMobileAlt, FaLayerGroup } from "react-icons/fa";
import { FaMicrophoneLines } from "react-icons/fa6";

export default function DetailedFeatures() {
    const features = [
        {
            title: "Smart AI Scheduling",
            desc: "AI analyzes your habits and automatically schedules tasks at optimal times for maximum productivity.",
            icon: <FaMagic />,
            className: "md:col-span-2 md:row-span-2" // Big Feature
        },
        {
            title: "Natural Language",
            desc: "Just speak your plans.",
            icon: <FaMicrophoneLines />,
            className: "md:col-span-1"
        },
        {
            title: "Prioritization",
            desc: "AI ranks your tasks.",
            icon: <FaCheckDouble />,
            className: "md:col-span-1"
        },
        {
            title: "Calendar Integration",
            desc: "Seamless sync with Google/Outlook/Apple.",
            icon: <FaCalendarAlt />,
            className: "md:col-span-1"
        },
        {
            title: "Time Blocking",
            desc: "Optimized focus blocks.",
            icon: <FaClock />,
            className: "md:col-span-1"
        },
        {
            title: "Context Aware",
            desc: "Smart notifications that know when you're free.",
            icon: <FaBell />,
            className: "md:col-span-2" // Wide Feature
        },
        {
            title: "Auto-Flow",
            desc: "Dynamic rescheduling.",
            icon: <FaLayerGroup />,
            className: "md:col-span-1"
        },
        {
            title: "Everywhere",
            desc: "Cross-platform sync.",
            icon: <FaMobileAlt />,
            className: "md:col-span-1"
        }
    ];

    return (
        <section className="py-32 px-4 bg-black" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white text-center md:text-left">
                        Powerful Features
                    </h2>
                    <p className="text-gray-500 text-xl text-center md:text-left max-w-2xl">
                        Everything you need to orchestrate your life, powered by intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] bg-white/10 border border-white/10 gap-px rounded-3xl overflow-hidden">
                    {features.map((feat, i) => (
                        <div key={i} className={`p-8 bg-black hover:bg-neutral-900/50 transition-colors duration-300 flex flex-col justify-between group ${feat.className || ""}`}>
                            <div className="text-3xl text-cyan-500 mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                                {feat.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors ${feat.className?.includes('col-span-2') ? 'text-2xl' : 'text-lg'}`}>
                                    {feat.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
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
