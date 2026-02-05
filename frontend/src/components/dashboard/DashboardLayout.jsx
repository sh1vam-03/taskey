import Sidebar from "./Sidebar"

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main
                className="flex-1 px-6 py-6"
                style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
            >
                {children}
            </main>
        </div>
    )
}

export default DashboardLayout
