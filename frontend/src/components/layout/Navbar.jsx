"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useTheme from "@/hooks/useDarkmode"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [theme, setTheme] = useTheme()
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" }
    ]

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 inset-x-0 z-50 flex justify-center py-4 px-6 pointer-events-none transition-all duration-300 ${scrolled ? "pt-2" : "pt-6"}`}
        >
            <div className={`relative flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-full pointer-events-auto border transition-all duration-500
                ${scrolled
                    ? "bg-black/60 backdrop-blur-md border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    : "bg-transparent border-transparent"}`}
            >
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tighter hover:text-cyan-400 transition-colors">
                    Taskey<span className="text-cyan-500">.ai</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5 backdrop-blur-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${pathname === link.path ? "text-black bg-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link href="/signup" className="px-5 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white"
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-opacity ${isOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-20 left-4 right-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 pointer-events-auto md:hidden shadow-2xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium text-gray-300 hover:text-cyan-400"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link href="/login" className="text-lg font-medium text-gray-300 hover:text-white">Login</Link>
                            <Link href="/signup" className="w-full text-center py-3 bg-white text-black font-bold rounded-xl mt-2">
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}

export default Navbar
