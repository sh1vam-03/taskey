import Sidebar from "@/components/dashboard/Sidebar";
import MobileHeader from "@/components/dashboard/MobileHeader";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-500">
            <Sidebar />
            <MobileHeader />

            <main className="md:ml-64 min-h-screen">
                <div className="max-w-[1200px] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
