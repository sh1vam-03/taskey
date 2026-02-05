import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function MarketingLayout({
    children,
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
            <Navbar />
            <main className="flex-1 pt-20 animate-in">{children}</main>
            <Footer />
        </div>
    )
}
