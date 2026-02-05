import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

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
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Modules</h4>
                        <ul className="space-y-3 text-xs text-gray-500">
                            <li><Link href="#features" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" />NeuralEngine</Link></li>
                            <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" />ResourceAlloc</Link></li>
                            <li><Link href="/api" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-700 rounded-full" />API_Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Protocol</h4>
                        <ul className="space-y-3 text-xs text-gray-500">
                            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">Manifesto</Link></li>
                            <li><Link href="/changelog" className="hover:text-cyan-400 transition-colors">Changelog_v1.0</Link></li>
                            <li><Link href="/status" className="hover:text-cyan-400 transition-colors">System_Status</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-6 border-b border-white/10 pb-2 inline-block">Compliance</h4>
                        <ul className="space-y-3 text-xs text-gray-500">
                            <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy_Protocol</Link></li>
                            <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms_of_Service</Link></li>
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
