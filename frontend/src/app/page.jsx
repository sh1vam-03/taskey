import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import AiEnergySphere from "@/components/ui/AiEnergySphere"
import Button from "@/components/ui/Button"

export default function Home() {
    return (
        <div className="min-h-screen font-sans bg-[var(--bg)] text-[var(--text)]">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
                {/* Background Energy Sphere */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-90 scale-125 md:scale-100 mix-blend-screen">
                    <AiEnergySphere size={550} speed={0.8} />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        AI Guardian Active • v1.0
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-tight" style={{ color: "var(--heading)" }}>
                        More Than a Planner. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 drop-shadow-sm">
                            A Thinking Partner.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-medium">
                        Taskey doesn't just list tasks. It guards your wellbeing, enforcing breaks,
                        negotiating workloads, and ensuring you don't burn out.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
                        <Link href="/signup">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-[0_20px_40px_-15px_rgba(6,182,212,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.5)] transition-all">
                                Get 10 Free AI Credits
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full backdrop-blur-md bg-white/50 border border-white/20">
                                How it Thinks
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* AI GUARDIAN CAPABILITIES (Based on System Prompt) */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: "var(--heading)" }}>
                            An AI That <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Says "No"</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                            Most apps let you overwork. Taskey actively intervenes to protect your long-term health.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Feature
                            title="Burnout Shield"
                            description="Automatically detects heavy mental loads and inserts mandatory 15-min recovery breaks."
                            icon="🛡️"
                        />
                        <Feature
                            title="Reality Check"
                            description="Rejects unrealistic 12-hour study marathons. It negotiates a plan you can actually finish."
                            icon="⚖️"
                        />
                        <Feature
                            title="Habit Architecture"
                            description="Builds consistency by tracking streaks, mood, and sleep alongside your work."
                            icon="🧬"
                        />
                    </div>
                </div>
            </section>

            {/* PRICING (MATCHING BACKEND CONFIG) */}
            <section className="py-32 px-6 bg-[var(--secondary)] border-y border-[var(--border)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--heading)" }}>
                            Invest in Consistency
                        </h2>
                        <p className="text-[var(--text-secondary)]">Start with free credits. Upgrade for serious leverage.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* FREE TIER */}
                        <PricingCard
                            title="Free Tier"
                            price="₹0"
                            features={[
                                "20 Tasks / mo",
                                "30 Scheduled Slots / mo",
                                "15 Behavior Logs / mo",
                                "10 AI Credits (One-time)"
                            ]}
                        />
                        {/* PRO TIER */}
                        <PricingCard
                            title="Pro"
                            price="₹499"
                            period="/mo"
                            features={[
                                "1,000 Tasks / mo",
                                "1,000 Scheduled Slots / mo",
                                "100 Behavior Logs / mo",
                                "50 AI Credits / mo"
                            ]}
                            highlight
                        />
                        {/* PRO PLUS */}
                        <PricingCard
                            title="Pro Plus"
                            price="₹999"
                            period="/mo"
                            features={[
                                "10,000 Tasks / mo",
                                "Unlimited Schedules",
                                "1,000 Behavior Logs / mo",
                                "90 AI Credits / mo"
                            ]}
                        />
                    </div>

                    <div className="mt-12 text-center text-sm opacity-60 max-w-2xl mx-auto">
                        * AI Credits power the Thinking Engine (GPT-4o-mini & Whisper).
                        1 Credit = ~1 Complex Planning Session.
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS (CREDITS) */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-3xl font-bold" style={{ color: "var(--heading)" }}>
                        Powered by Advanced Intelligence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                            <div className="font-bold text-lg mb-2">GPT-4o Mini</div>
                            <p className="text-sm opacity-80">The reasoning core that understands context, nuance, and human psychology.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                            <div className="font-bold text-lg mb-2">Whisper v3</div>
                            <p className="text-sm opacity-80">Speak your mind. We transcribe and structure your thoughts instantly.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                            <div className="font-bold text-lg mb-2">Tavily</div>
                            <p className="text-sm opacity-80">Real-time scheduling data and external context awareness.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-40 px-6 text-center overflow-hidden relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-cyan-500/10 to-transparent rounded-full -z-10 blur-3xl" />

                <div className="max-w-3xl mx-auto space-y-10">
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ color: "var(--heading)" }}>
                        Ready to Find Balance?
                    </h2>
                    <p className="text-xl text-[var(--text-secondary)]">
                        Your AI Partner is ready. Claim your 10 free credits now.
                    </p>
                    <div className="pt-4">
                        <Link href="/signup">
                            <Button size="lg" className="h-16 px-12 rounded-full text-xl shadow-2xl hover:scale-105">
                                Join Taskey
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

/* Feature Component */
const Feature = ({ title, description, icon }) => (
    <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-[var(--secondary)] text-2xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ color: "var(--heading)" }}>{title}</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
)

/* Pricing Card Component */
const PricingCard = ({ title, price, period, features, highlight }) => (
    <div className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col ${highlight ? 'bg-[var(--bg)] border-blue-500/50 shadow-2xl scale-105 relative z-10' : 'bg-[var(--card)] border-[var(--border)] opacity-90 hover:opacity-100'}`}>
        {highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--heading)" }}>{title}</h3>
        <div className="text-4xl font-bold mb-6" style={{ color: "var(--heading)" }}>{price}<span className="text-lg opacity-50 font-normal">{period}</span></div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="text-green-500">✓</span> {feat}
                </li>
            ))}
        </ul>
        <Link href="/signup" className="w-full">
            <Button variant={highlight ? "primary" : "outline"} className="w-full h-12 rounded-xl">
                Choose {title}
            </Button>
        </Link>
    </div>
)
