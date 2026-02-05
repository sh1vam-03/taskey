"use client";
import { FaMicrophone, FaBrain, FaCheckCircle } from "react-icons/fa";

export default function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "Input",
            subtitle: "Tell Your Assistant",
            desc: "Describe tasks naturally. \"Workout at 7am\" or \"Project review on Friday\".",
            icon: <FaMicrophone />
        },
        {
            id: "02",
            title: "Process",
            subtitle: "AI Creates Schedule",
            desc: "Our engine analyzes your calendar, priorities, and energy levels to build the perfect plan.",
            icon: <FaBrain />
        },
        {
            id: "03",
            title: "Execute",
            subtitle: "Stay On Track",
            desc: "Receive smart nudges, adaptive rescheduling, and burnout protection.",
            icon: <FaCheckCircle />
        }
    ];

    return (
        <section className="py-32 px-4 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white text-center md:text-left">
                        How Taskey Works
                    </h2>
                    <p className="text-gray-500 text-xl text-center md:text-left">
                        From chaos to clarity in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px bg-linear-to-r from-transparent via-cyan-900/50 to-transparent border-t border-dashed border-cyan-900/50" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            {/* Step Number Badge */}
                            <div className="w-16 h-16 mx-auto mb-8 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-xl font-mono font-bold text-cyan-500 relative z-10 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300">
                                {step.id}
                            </div>

                            <div className="p-8 bg-black border border-white/10 rounded-3xl hover:bg-white/5 transition-all duration-300 h-full">
                                <h4 className="text-xs font-mono text-cyan-500 mb-2 uppercase tracking-widest">{step.title}</h4>
                                <h3 className="text-2xl font-bold text-white mb-4">{step.subtitle}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
