import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

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
                            <div className="w-2 h-2 bg-cyan-500 rounded-sm" />
                            TASKEY_SYSTEMS
                        </Link>
                        <p className="text-gray-600 text-xs leading-relaxed max-w-[200px]">
                            // AUTOMATED_AGENCY<br />
                            Optimizing human cognitive throughput via adaptive intelligence protocols.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Product</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/#features"><span className="w-1 h-1 bg-gray-700 rounded-full group-hover:bg-cyan-500 transition-colors" />System_Capes</FooterLink></li>
                            <li><FooterLink href="/#pricing"><span className="w-1 h-1 bg-gray-700 rounded-full group-hover:bg-cyan-500 transition-colors" />Pricing_Grid</FooterLink></li>
                            <li><FooterLink href="/#how-it-works"><span className="w-1 h-1 bg-gray-700 rounded-full group-hover:bg-cyan-500 transition-colors" />Workflow_Logic</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Company</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/about">Manifesto</FooterLink></li>
                            <li><FooterLink href="/careers">Neural_Collective</FooterLink></li>
                            <li><FooterLink href="/contact">Establish_Uplink</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Legal</h4>
                        <ul className="space-y-1">
                            <li><FooterLink href="/privacy">Privacy_Protocol</FooterLink></li>
                            <li><FooterLink href="/terms">System_Contract</FooterLink></li>
                            <li><FooterLink href="/security">Security_Arch</FooterLink></li>
                        </ul>
                    </div>
                </div>

                {/* System Status Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-white/10 text-[10px] text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-8">
                        <span>LATENCY: 12ms</span>
                        <span>REGION: ASIA_EAST</span>
                        <span className="flex items-center gap-2">
                            STATUS:
                            <span className="text-green-500">OPTIMAL</span>
                        </span>
                    </div>

                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>© 2026 TASKEY INC.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
