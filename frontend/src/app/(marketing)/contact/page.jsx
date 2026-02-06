"use client";
import React from "react";
import { motion } from "framer-motion";
import { useContactForm } from "@/features/contact-form/useContactForm";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function ContactPage() {
    const {
        values,
        errors,
        isSubmitting,
        result,
        handleChange,
        handleSubmit
    } = useContactForm();

    return (
        <div className="min-h-screen bg-black text-white -mt-20 pt-32 pb-20 px-4 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-500">
            {/* GLOBAL BACKGROUND (Shared with Landing/About) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* HERO HEADER */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 rounded-full mb-8">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest">
                            SIGNAL: STABLE
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white">
                        Establish Uplink
                    </h1>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
                        Initiate a secure transmission channel to our engineering team.
                        We are listening.
                    </p>
                </div>

                {/* TRANSMISSION CONSOLE (Auth Style Layout) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center w-full"
                >
                    <div className="flex flex-col gap-6 p-8 border border-white/10 w-full max-w-md rounded-md shadow-2xl bg-black/80 backdrop-blur-md relative overflow-hidden">

                        {/* Tech Decorators */}
                        <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                        <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                        <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                        <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>

                        <div className="mb-2 text-center">
                            <h2 className="text-xl font-bold text-white">Secure Uplink</h2>
                            <p className="text-gray-500 text-sm">Enter designation credentials</p>
                        </div>

                        {result && (
                            <div className={`p-4 rounded text-sm ${result.type === "success"
                                ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                                : "bg-red-500/10 border border-red-500/30 text-red-500"
                                }`}>
                                {result.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Name Input */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-300">
                                    Designation (Name)
                                </label>
                                <input
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full text-sm border border-white/20 bg-black/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-300">
                                    Comms Channel (Email)
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className="w-full text-sm border border-white/20 bg-black/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-300">
                                    Payload Data (Message)
                                </label>
                                <textarea
                                    name="message"
                                    value={values.message}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Enter transmission content..."
                                    className="w-full text-sm border border-white/20 bg-black/50 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <div className="mt-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full uppercase tracking-wider"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner size="sm" className="text-black" />
                                            Establishing...
                                        </span>
                                    ) : (
                                        "Initiate Transmission"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Footer Decorator */}
                <div className="mt-12 text-center">
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        SECURE CONSOLE V1.0.4 • ENCRYPTED
                    </p>
                </div>
            </div>
        </div>
    );
}
