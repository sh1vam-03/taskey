import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../../components/dashboard/Sidebar"
import StreakOverview from "../../components/dashboard/StreakOverview"
import StreakCalendar from "../../components/dashboard/StreakCalendar"



const DashboardLayout = () => {
  const [open, setOpen] = useState(false)

   const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  
  const [calendarView, setCalendarView] = useState("day")

  const streakData = {
    currentStreak: 5,
    longestStreak: 12,
    isActive: true,
  }

  const streakCalendar = {
    "2023-12-25": true,
    "2023-12-24": false,
    "2023-12-23": true,
    "2023-12-22": true,
    "2023-12-21": false,
    "2023-12-20": true,
    "2023-12-19": true,
  }


  return (
    <div className="min-h-screen flex">



      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-4 px-4 py-3 border-b"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setOpen(true)}
            className="text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-semibold">Dashboard</span>
        </header>

        <main
          className="flex-1 px-4 md:px-6 py-6"
          style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
        >
          <Outlet />

           <StreakOverview data={streakData} />
      <StreakCalendar calendar={streakCalendar} />
     


        </main>


      </div>
    </div>
  )
}

export default DashboardLayout
