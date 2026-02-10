import { useState } from "react"
import Sidebar from "../../components/layout/sidebar"
import Overview from "../../components/dashboard/Overview"
import Calendar from "../../components/calendar/Calendar"
import Tasks from "../../components/tasks/tasks"
import { TasksProvider } from "../../context/Taskscontext"

const Dashboard = () => {
  const [section, setSection] = useState("overview")
  const [open, setOpen] = useState(false)

  return (
    <div
      className="flex min-h-screen relative"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      {/* Sidebar */}
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        active={section}
        onNavigate={(id) => {
          setSection(id)
          setOpen(false) // auto-close on mobile
        }}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
          style={{
            backgroundColor: "var(--bg)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-2 border rounded-lg"
            style={{ borderColor: "var(--border)" }}
          >
            ☰
          </button>

          <span className="font-semibold">Taskey</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {section === "overview" && <Overview />}

          {section === "calendar" && (
            <Calendar openTasks={() => setSection("tasks")} />
          )}

          {section === "tasks" && <Tasks />}
        </main>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-20"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <TasksProvider>
      <Dashboard />
    </TasksProvider>
  )
}
