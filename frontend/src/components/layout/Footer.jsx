import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
                            Taskey<span className="text-cyan-500">.ai</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            AI-powered task and schedule management for modern professionals.
                            <br />
                            Built for the future of work.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/integrations" className="hover:text-cyan-400 transition-colors">Integrations</Link></li>
                            <li><Link href="/api" className="hover:text-cyan-400 transition-colors">API</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
                            <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link></li>
                            <li><Link href="/security" className="hover:text-cyan-400 transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-white/5">
                    <p className="text-gray-600 text-xs">
                        © 2026 Taskey AI. All rights reserved.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <FaGithub className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                        <FaTwitter className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                        <FaLinkedin className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
