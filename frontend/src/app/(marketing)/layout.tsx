import Navbar from "@/components/layout/Navbar"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
        </>
    )
}
