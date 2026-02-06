"use client";
import React from "react";
import Button from "@/components/ui/Button";

export default function PrivacyPage() {
    const lastUpdated = "October 24, 2025";

    return (
        <div className="min-h-screen bg-black text-gray-300 -mt-20 pt-32 pb-20 px-4 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* GLOBAL BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-16 border-b border-white/10 pb-8">
                    <div className="inline-block border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-6">
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            // ENCRYPTED_CONNECTION
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Privacy Protocols</h1>
                    <p className="text-sm font-mono text-gray-500">LAST_UPDATE: {lastUpdated}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-sm relative overflow-hidden">
                    {/* Tech Decorators */}
                    <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                    <div className="space-y-12 text-lg leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. The Prime Directive</h2>
                            <p>
                                Taskey ("The System") generates value by analyzing your intent, not by trading your identity.
                                We believe that your thoughts, tasks, and behavioral patterns ("Neural Data") are extensions of your mind and remain your sovereign property.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Data Ingestion</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li><strong>Identity Tokens:</strong> Name, email address, and authentication credentials used to establish your uplink.</li>
                                <li><strong>Operational Data:</strong> Tasks, schedules, goals, and project metadata you input into the interface.</li>
                                <li><strong>Behavioral Metrics:</strong> Completion velocity, focus times, and interaction patterns used to calibrate the AI model.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. AI Processing & The Neural Engine</h2>
                            <p className="mb-4">
                                To function as a "Thinking Partner," Taskey processes your Operational Data through Large Language Models (LLMs).
                            </p>
                            <div className="bg-white/5 border-l-2 border-cyan-500 p-4 rounded-r-md">
                                <p className="text-sm text-cyan-200">
                                    <strong>System Logic:</strong> We do not use your Operational Data to train public foundation models.
                                    Your data is ephemeral to the inference process or stored within your private vector embeddings.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Storage & Encryption</h2>
                            <p>
                                All data transmission occurs over SSL/TLS 1.3 encrypted channels.
                                Data at rest is protected using AES-256 standard encryption within our secure cloud enclaves.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. User Sovereignty</h2>
                            <p className="mb-4">You maintain absolute control over your node:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li><strong>Export:</strong> You may request a raw JSON dump of your neural graph at any time.</li>
                                <li><strong>Deletion:</strong> Initiating the "Purge Protocol" (Account Deletion) permanently wipes your data from our active shards immediately.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Contact Signal</h2>
                            <p>
                                For privacy audits or data requests, establish a direct line to our Data Protection Officer: <br />
                                <a href="mailto:privacy@taskey.ai" className="inline-block mt-4">
                                    <Button variant="scanline" size="md">
                                        privacy@taskey.ai
                                    </Button>
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
