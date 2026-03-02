import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

// ─── FooterLink ───────────────────────────────────────────────────────────────
const FooterLink = ({ href, children }) => (
    <Link
        href={href}
        className="relative inline-flex items-center gap-2 px-3 py-1.5
                   text-[11px] font-mono text-white/25
                   hover:text-[var(--color-primary,#06b6d4)]
                   transition-colors duration-200 rounded-sm group overflow-hidden"
    >
        <span className="relative z-10">{children}</span>

        {/* Hover surface */}
        <span className="absolute inset-0 bg-[var(--color-primary-muted,rgba(6,182,212,0.08))]
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Bottom accent line */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2
                         h-px w-0 bg-[var(--color-primary,#06b6d4)]
                         group-hover:w-full transition-all duration-250" />
    </Link>
);

// ─── SocialLink ───────────────────────────────────────────────────────────────
const SocialLink = ({ href, icon: Icon }) => (
    <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-7 h-7 rounded-sm
                   border border-white/[0.07]
                   text-white/25 hover:text-[var(--color-primary,#06b6d4)]
                   hover:border-[var(--color-primary-border,rgba(6,182,212,0.28))]
                   hover:bg-[var(--color-primary-muted,rgba(6,182,212,0.08))]
                   transition-all duration-200"
    >
        <Icon className="w-3.5 h-3.5" />
    </Link>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/[0.07] pt-10 md:pt-16 pb-8 font-mono relative overflow-hidden">

            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none
                            bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]
                            bg-[size:40px_40px]" />

            {/* Subtle cyan glow — top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2
                            w-[600px] h-px
                            bg-gradient-to-r from-transparent via-[var(--color-primary,#06b6d4)] to-transparent
                            opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* ── Main grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-base font-black
                                       tracking-tighter text-white mb-5
                                       hover:text-[var(--color-primary,#06b6d4)]
                                       transition-colors duration-200"
                        >
                            TASKTIME
                        </Link>

                        <p className="text-white/20 text-[11px] leading-relaxed max-w-[200px] mb-5">
                            AI-powered task and schedule management built to help you focus, prioritize, and get more done.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-2">
                            <SocialLink href="https://instagram.com/sh1vam.03" icon={FaInstagram} />
                            <SocialLink href="https://github.com/sh1vam-03" icon={FaGithub} />
                            <SocialLink href="https://linkedin.com/in/sh1vam~03" icon={FaLinkedin} />
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.22em]
                                       mb-5 pb-2 border-b border-white/[0.06]">
                            Product
                        </h4>
                        <ul className="space-y-0.5">
                            <li><FooterLink href="/#features">Features</FooterLink></li>
                            <li><FooterLink href="/#pricing">Pricing</FooterLink></li>
                            <li><FooterLink href="/#how-it-works">How It Works</FooterLink></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.22em]
                                       mb-5 pb-2 border-b border-white/[0.06]">
                            Company
                        </h4>
                        <ul className="space-y-0.5">
                            <li><FooterLink href="/about">About</FooterLink></li>
                            <li><FooterLink href="/careers">Careers</FooterLink></li>
                            <li><FooterLink href="/contact">Contact</FooterLink></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.22em]
                                       mb-5 pb-2 border-b border-white/[0.06]">
                            Legal
                        </h4>
                        <ul className="space-y-0.5">
                            <li><FooterLink href="/privacy">Privacy</FooterLink></li>
                            <li><FooterLink href="/terms">Terms</FooterLink></li>
                            <li><FooterLink href="/security">Security</FooterLink></li>
                        </ul>
                    </div>

                </div>

                {/* ── Bottom bar ────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4
                                pt-6 border-t border-white/[0.06]
                                text-[10px] text-white/20 uppercase tracking-[0.18em]">

                    <div className="flex flex-col items-center gap-3 md:gap-6 text-center md:flex-row md:text-left">
                        <span>
                            Built for focus.{" "}
                            <span className="text-[var(--color-primary,#06b6d4)] opacity-70">
                                Powered by AI
                            </span>
                            .
                        </span>
                        <span className="hidden md:inline text-white/10">|</span>
                        <span>
                            Made with ❤️ in{" "}
                            <span className="text-[var(--color-primary,#06b6d4)] opacity-70">India</span>
                        </span>
                    </div>

                    <span>&copy; 2026 TASKTIME. All rights reserved.</span>
                </div>

            </div>
        </footer>
    );
};

export default Footer;