import { FaMagic, FaCalendarAlt, FaCheckDouble, FaClock, FaBell, FaSync, FaMobileAlt, FaLayerGroup } from "react-icons/fa";

export default function DetailedFeatures() {
    const features = [
        {
            title: "Smart AI Scheduling",
            desc: "AI analyzes your habits and automatically schedules tasks at optimal times for maximum productivity.",
            icon: <FaMagic />
        },
        {
            title: "Intelligent Prioritization",
            desc: "Never miss what matters. AI prioritizes your tasks based on deadlines, importance, and dependencies.",
            icon: <FaCheckDouble />
        },
        {
            title: "Natural Language Input",
            desc: "Just type or speak naturally. \"Schedule a meeting with John next Tuesday at 3pm\" - and it's done.",
            icon: <FaMicrophoneAltIcon />
        },
        {
            title: "Calendar Integration",
            desc: "Seamlessly syncs with Google Calendar, Outlook, and Apple Calendar for unified schedule management.",
            icon: <FaCalendarAlt />
        },
        {
            title: "Time Blocking",
            desc: "AI creates optimized time blocks for focused work, meetings, and breaks throughout your day.",
            icon: <FaClock />
        },
        {
            title: "Smart Reminders",
            desc: "Context-aware notifications that remind you at the perfect moment, not just at scheduled times.",
            icon: <FaBell />
        },
        {
            title: "Auto-scheduling",
            desc: "AI automatically finds the best slots for your tasks considering all your constraints and preferences.",
            icon: <FaLayerGroup />
        },
        {
            title: "Cross-platform Sync",
            desc: "Access your tasks and schedule anywhere - desktop, mobile, and web - always in perfect sync.",
            icon: <FaMobileAlt />
        }
    ];

    return (
        <section className="py-24 px-6 bg-black" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Powerful Features</h2>
                    <p className="text-gray-400 text-xl">Everything you need to stay organized.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {features.map((feat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-colors group">
                            <div className="text-2xl text-cyan-500 mb-4 group-hover:scale-110 transition-transform w-fit">{feat.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const FaMicrophoneAltIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 377.34 48 310.1 48 240v-48c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v48c0 100.27 77.21 182.25 176 189.69V464H112c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h128c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-64v-30.31c98.79-7.44 176-89.41 176-189.69v-48c0-8.84-7.16-16-16-16z"></path></svg>
)
