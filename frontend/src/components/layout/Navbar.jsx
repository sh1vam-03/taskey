"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Button from "@/components/ui/Button"
import { FaChevronDown } from "react-icons/fa"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [hoveredTab, setHoveredTab] = useState(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navData = {
        Product: [
            { name: "System_Capes", path: "/#features" },
            { name: "Methodology", path: "/#how-it-works" }, // Renamed from Workflow_Logic to Methodology in main generic map? User said "Methodology" in request but Footer has Workflow_Logic. User said "replace... with ... when user hover on it show its links just like in the footer". Footer has "Workflow_Logic". I should probably use Footer's names: System_Capes, Pricing_Grid, Workflow_Logic.
            // Wait, user said "replace ... Feature, Methodology, Pricing ... with Product, Company, Legal".
            // So Product -> System_Capes, Pricing_Grid, Workflow_Logic
            { name: "Pricing_Grid", path: "/#pricing" },
            { name: "Workflow_Logic", path: "/#how-it-works" }
        ],
        Company: [
            { name: "Manifesto", path: "/about" },
            { name: "Neural_Collective", path: "/careers" },
            { name: "Establish_Uplink", path: "/contact" }
        ],
        Legal: [
            { name: "Privacy_Protocol", path: "/privacy" },
            { name: "System_Contract", path: "/terms" },
            { name: "Security_Arch", path: "/security" }
        ]
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-500 border-b ${scrolled ? "bg-black/90 backdrop-blur-xl border-white/10" : "bg-transparent border-transparent"}`}
            onMouseLeave={() => setHoveredTab(null)}
        >
            {/* Bottom Gradient Line (Active on Scroll) */}
            <div className={`absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

            <div className="w-full max-w-7xl px-6 h-20 flex items-center justify-between relative z-10">

                {/* Left: Logo & Status */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="group flex items-center gap-3">
                        {/* Logo Text Only - No [T] Box */}
                        <div className="flex items-center gap-2">
                            {/* Small dot accent to maintain tech feel */}
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-sm group-hover:animate-pulse" />
                            <span className="text-lg font-bold tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                                TASKEY
                            </span>
                        </div>
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

                {/* Center: Tech Menu (Dropdowns) */}
                <div className="hidden md:flex items-center gap-8 translate-x-12">
                    {Object.keys(navData).map((category) => (
                        <div
                            key={category}
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setHoveredTab(category)}
                        >
                            <button className="relative px-5 py-2 text-xs font-mono font-bold text-gray-400 group-hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1.5 overflow-hidden rounded-sm">
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {category}
                                    <FaChevronDown className={`w-2 h-2 transition-transform duration-300 ${hoveredTab === category ? "rotate-180 text-cyan-500" : ""}`} />
                                </span>

                                {/* Hover BG */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Bottom Line */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-300" />
                            </button>

                            {/* Dropdown Panel */}
                            <AnimatePresence>
                                {hoveredTab === category && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-[70%] left-1/2 -translate-x-1/2 w-48 bg-black border border-white/10 shadow-2xl rounded-sm overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-[size:20px_20px] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-50 pointer-events-none" />

                                        <div className="py-2 relative z-10">
                                            {/* Header Stripe */}
                                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                                <span className="text-[10px] text-gray-600 font-mono flex items-center gap-2">
                                                    // {category.toUpperCase()}_DIR
                                                </span>
                                            </div>

                                            {/* Links */}
                                            <div className="flex flex-col">
                                                {navData[category].map((link) => (
                                                    <Link
                                                        key={link.name}
                                                        href={link.path}
                                                        className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-mono tracking-wide flex items-center gap-2 group/link"
                                                    >
                                                        <span className="w-1 h-1 bg-gray-700 rounded-full group-hover/link:bg-cyan-500 transition-colors" />
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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

                        <div className="flex flex-col p-6 space-y-6 relative z-10 max-h-[80vh] overflow-y-auto">
                            {Object.entries(navData).map(([category, links]) => (
                                <div key={category} className="space-y-3">
                                    <h4 className="text-xs font-bold font-mono text-cyan-600 uppercase tracking-widest border-b border-white/10 pb-2">
                                        // {category}
                                    </h4>
                                    <div className="flex flex-col space-y-2 pl-4 border-l border-white/5">
                                        {links.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.path}
                                                onClick={() => setIsOpen(false)}
                                                className="text-sm font-mono text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
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
