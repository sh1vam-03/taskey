"use client";
import { FaMicrophone, FaBrain, FaCheckCircle } from "react-icons/fa";

export default function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "INPUT_NODE",
            subtitle: "Natural Input",
            desc: "Voice or text command injection.",
            icon: <FaMicrophone />
        },
        {
            id: "02",
            title: "PROCESS_CORE",
            subtitle: "Neural Analysis",
            desc: "Pattern recognition & optimization.",
            icon: <FaBrain />
        },
        {
            id: "03",
            title: "OUTPUT_STREAM",
            subtitle: "Execution",
            desc: "Schedule generation & compliance.",
            icon: <FaCheckCircle />
        }
    ];

    return (
        <section className="py-32 px-4 bg-black border-t border-white/5" id="how-it-works">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 border-b border-white/10 pb-6">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
                        Workflow Logic
                    </h2>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                        // EXECUTION_PIPELINE
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
                    {/* Circuit Line (Desktop) */}
                    <div className="hidden md:block absolute top-[40px] left-0 right-0 h-px bg-white/10 z-0">
                        <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                    </div>

                    {steps.map((step, i) => (
                        <div key={i} className="relative group pt-20 px-6 border-l border-white/5 first:border-l-0">
                            {/* Circuit Node */}
                            <div className="absolute top-[32px] left-6 w-4 h-4 bg-black border-2 border-white/20 rounded-full z-10 group-hover:border-cyan-400 group-hover:bg-cyan-900 transition-colors">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full group-hover:bg-cyan-200" />
                            </div>

                            <div className="space-y-4">
                                <div className="text-cyan-500 opacity-0 transform -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    {step.icon}
                                </div>

                                <div>
                                    <h4 className="font-mono text-xs text-gray-600 mb-1 group-hover:text-cyan-500 transition-colors uppercase tracking-widest">
                                        [{step.title}]
                                    </h4>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                        {step.subtitle}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-mono leading-relaxed">
                                        {"> " + step.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
