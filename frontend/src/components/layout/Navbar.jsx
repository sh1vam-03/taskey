"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/components/ui/Button"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Features", path: "#features" },
        { name: "Methodology", path: "#how-it-works" },
        { name: "Pricing", path: "#pricing" }
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-500 border-b ${scrolled ? "bg-black/90 backdrop-blur-xl border-white/10" : "bg-transparent border-transparent"}`}
        >
            {/* Bottom Gradient Line (Active on Scroll) */}
            <div className={`absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

            <div className="w-full max-w-7xl px-6 h-20 flex items-center justify-between">

                {/* Left: Logo & Status */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-black border border-white/20 rounded-sm group-hover:border-cyan-500/50 transition-colors overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="font-bold text-white relative z-10 text-lg">T</span>
                        </div>
                        <span className="text-lg font-bold tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                            TASKEY
                        </span>
                    </Link>

                    {/* Desktop Status Indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black border border-white/10 rounded-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 tracking-wider">SYS.ONLINE</span>
                    </div>
                </div>

                {/* Center: Tech Menu */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-sm border border-white/5 backdrop-blur-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="relative px-5 py-2 text-xs font-mono text-gray-400 hover:text-cyan-400 transition-all rounded-sm uppercase tracking-wide group overflow-hidden"
                        >
                            <span className="relative z-10 group-hover:font-bold transition-all duration-300">
                                {link.name}
                            </span>
                            {/* Hover BG */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {/* Bottom Line */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/login" className="text-xs font-mono font-bold text-gray-400 hover:text-white transition-colors uppercase relative group">
                        <span className="group-hover:opacity-0 transition-opacity">// ACCESS_TERMINAL</span>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 tracking-widest text-center">LOGIN</span>
                    </Link>

                    <Link href="/signup">
                        <Button variant="scanline" size="sm">
                            INITIALIZE
                        </Button>
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white border border-white/10 bg-white/5 hover:bg-white/10"
                >
                    <div className="space-y-1.5">
                        <span className={`block w-5 h-px bg-current transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-5 h-px bg-current transition-opacity ${isOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-5 h-px bg-current transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu Dropdown (Tech Style) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-20 left-0 right-0 bg-black border-b border-white/10 overflow-hidden md:hidden shadow-2xl"
                    >
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_2px,rgba(0,0,0,0.5)_2px)] bg-[size:100%_4px] pointer-events-none opacity-50" />

                        <div className="flex flex-col p-6 space-y-4 relative z-10">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm font-mono text-gray-400 hover:text-cyan-400 border-l-2 border-transparent hover:border-cyan-500 pl-4 transition-all py-2 hover:bg-white/5"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-2" />
                            <Link href="/login" className="text-sm font-mono text-white hover:text-cyan-400 pl-4 py-2">
                                {">"} LOGIN_TERMINAL
                            </Link>
                            <Link href="/signup" className="w-full">
                                <Button variant="scanline" className="w-full justify-center">
                                    INITIALIZE_SYSTEM
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

export default Navbar
