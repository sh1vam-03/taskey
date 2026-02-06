"use client";
import React from "react";
import { motion } from "framer-motion"; // Assuming framer-motion is available as it's used elsewhere
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

                {/* TRANSMISSION CONSOLE (Form) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-sm backdrop-blur-sm relative overflow-hidden"
                >
                    {/* Tech Decorators */}
                    <div className="absolute top-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute top-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-white/20 font-mono">+</div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-white/20 font-mono">+</div>
                    {/* Console Scanline Decorator */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

                    {result && (
                        <div className={`p-4 mb-8 rounded ${result.type === "success"
                            ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                            : "bg-red-500/10 border border-red-500/30 text-red-500"
                            } font-mono text-sm`}>
                            {result.type === 'success' ? '> TRANSMISSION_RECEIVED' : '> ERROR: SIGNAL_LOST'} : {result.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name Input */}
                        <div className="group">
                            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                                // IDENTITY_TOKEN
                            </label>
                            <input
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                placeholder="Enter designation..."
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-700 outline-none focus:border-cyan-500 transition-colors font-mono"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-2 font-mono">! {errors.name}</p>}
                        </div>

                        {/* Email Input */}
                        <div className="group">
                            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                                // COMMS_CHANNEL (EMAIL)
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                placeholder="user@node.sys"
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-700 outline-none focus:border-cyan-500 transition-colors font-mono"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-2 font-mono">! {errors.email}</p>}
                        </div>

                        {/* Message Input */}
                        <div className="group">
                            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">
                                // PAYLOAD_DATA
                            </label>
                            <textarea
                                name="message"
                                value={values.message}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Enter transmission content..."
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-700 outline-none focus:border-cyan-500 transition-colors font-mono resize-none"
                            />
                            {errors.message && <p className="text-red-500 text-xs mt-2 font-mono">! {errors.message}</p>}
                        </div>

                        <div className="pt-4">
                            <Button
                                variant="scanline"
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner size="sm" className="text-black" />
                                        TRANSMITTING...
                                    </span>
                                ) : (
                                    "INITIATE_TRANSMISSION"
                                )}
                            </Button>
                        </div>
                    </form>
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
