"use client";
import { motion } from "framer-motion";
import { FaMicrophone, FaBrain, FaCheckCircle } from "react-icons/fa";

export default function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "Tell Your AI Assistant",
            desc: "Simply describe your tasks in natural language. \"Prepare presentation for Friday\" or \"Daily workout at 7am\".",
            icon: <FaMicrophone />
        },
        {
            id: "02",
            title: "AI Creates Your Schedule",
            desc: "Our AI analyzes your calendar, priorities, and work patterns to create an optimized schedule.",
            icon: <FaBrain />
        },
        {
            id: "03",
            title: "Stay On Track Effortlessly",
            desc: "Get intelligent reminders, automatic rescheduling, and insights to keep you productive.",
            icon: <FaCheckCircle />
        }
    ];

    return (
        <section className="py-32 px-6 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">How Taskey Works</h2>
                    <p className="text-gray-400 text-xl">Get started in minutes and let AI handle the complexity.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Line Connector */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-900 to-transparent -z-10" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative pt-8 group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black border border-white/10 rounded-full flex items-center justify-center text-cyan-500 font-bold z-10 group-hover:border-cyan-500 transition-colors">
                                {step.id}
                            </div>
                            <div className="text-center p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                                <div className="text-4xl text-white mb-6 flex justify-center">{step.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
