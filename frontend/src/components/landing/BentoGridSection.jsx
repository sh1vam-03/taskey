"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { FaBrain, FaSync, FaShieldAlt } from "react-icons/fa";
import { MdSmartToy } from "react-icons/md";

const BentoGridSection = () => {
    const CONTAINER_CLASS = "w-full max-w-[var(--container-width)] mx-auto px-[var(--container-padding)]";

    return (
        <section className={`py-[var(--section-spacing)] ${CONTAINER_CLASS}`}>
            <div className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-8">
                <div>
                    <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tighter mb-4 text-white">
                        Everything You Need to Stay Organized
                    </h2>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                        Powerful tools designed to simplify your day.
                    </p>
                </div>
            </div>

            <BentoGrid>
                <BentoGridItem
                    title="Your Personal Planning Partner"
                    description="TASKTIME looks at your sleep, mood, and exercise to understand when you're most productive. It uses this data to suggest the best times for your work, giving you a clear score on how well you're doing."
                    header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                    icon={<FaBrain />}
                    className="md:col-span-2"
                />
                <BentoGridItem
                    title="Real-Time Sync"
                    description="Access your tasks instantly across all devices without missing a thing."
                    header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                    icon={<FaSync />}
                    className="md:col-span-1"
                />
                <BentoGridItem
                    title="Progress Tracking"
                    description="See exactly how you're doing with simple scores for productivity and behavior."
                    header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                    icon={<FaShieldAlt />}
                    className="md:col-span-1"
                />
                <BentoGridItem
                    title="Switchable Multi-Model AI"
                    description="Use Gemini for rapid dashboard sync, GPT-4o-mini for complex goal decomposition, and Sarvam for native Indic support with OpenAI Whisper and TTS-1."
                    header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                    icon={<MdSmartToy />}
                    className="md:col-span-2"
                />
            </BentoGrid>
        </section>
    );
};

export default BentoGridSection;
