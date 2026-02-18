import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const FooterLink = ({ href, children }) => (
    <Link
        href={href}
        className="relative px-3 py-1 text-xs text-gray-500 hover:text-cyan-400 transition-all rounded-sm group overflow-hidden inline-block"
    >
        <span className="relative z-10 group-hover:font-bold transition-all duration-300 flex items-center gap-2">
            {children}
        </span>
        {/* Hover BG */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Bottom Line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-300" />
    </Link>
);

const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-xl font-bold tracking-tighter text-white mb-6 flex items-center gap-2">
                            TASKTIME
                        </Link>
                        <p className="text-gray-600 text-xs leading-relaxed max-w-[200px]">
                            AI-powered task and schedule management<br />
                            built to help you focus, prioritize, and get more done.
                        </p>
                        <div className="flex gap-6 mt-4 w-fit">
                            <Link href="https://instagram.com/sh1vam.03" target="_blank" className="text-cyan-600 hover:text-red-500">
                                <FaInstagram className="w-4 h-4" />
                            </Link>
                            <Link href="https://github.com/sh1vam-03" target="_blank" className="text-cyan-600 hover:text-white">
                                <FaGithub className="w-4 h-4" />
                            </Link>
                            <Link href="https://linkedin.com/in/sh1vam~03" target="_blank" className="text-cyan-600 hover:text-blue-700">
                                <FaLinkedin className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Product</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/#features">Features</FooterLink></li>
                            <li><FooterLink href="/#pricing">Pricing</FooterLink></li>
                            <li><FooterLink href="/#how-it-works">How It Works</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Company</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/about">About</FooterLink></li>
                            <li><FooterLink href="/careers">Careers</FooterLink></li>
                            <li><FooterLink href="/contact">Contact</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Legal</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/privacy">Privacy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms</FooterLink></li>
                            <li><FooterLink href="/security">Security</FooterLink></li>
                        </ul>
                    </div>

                </div>

                {/* System Status Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-white/10 text-[10px] text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-8">
                        <span className="flex items-center">
                            Built for focus.
                            <span className="text-green-700">Powered by AI</span>
                            .
                        </span>
                        <span>Made with ❤️ in <span className="text-cyan-500">India</span>.</span>
                    </div>

                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>&copy; 2026 TASKTIME. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
