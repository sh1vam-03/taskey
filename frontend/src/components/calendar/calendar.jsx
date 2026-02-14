import { useState } from "react"
import { useTasks } from "../../context/Taskscontext"
import CalendarHeader from "./CalendarHeader"
import DayView from "./DayView"
import WeekView from "./WeekView"
import MonthView from "./MonthView"

const Calendar = ({ openTasks }) => {
  const { selectedDate, setSelectedDate } = useTasks()
  const [view, setView] = useState("month")
  const [date, setDate] = useState(new Date())

  const formatDate = () => date.toDateString()

  const onPrev = () => {
    const d = new Date(date)
    d.setDate(
      d.getDate() -
      (view === "day" ? 1 : view === "week" ? 7 : 30)
    )
    setDate(d)
  }

  const onNext = () => {
    const d = new Date(date)
    d.setDate(
      d.getDate() +
      (view === "day" ? 1 : view === "week" ? 7 : 30)
    )
    setDate(d)
  }

  const onToday = () => setDate(new Date())

  // ✅ This is the only click handler needed
  const handleSelect = (date) => {
    setSelectedDate(date)
    if (openTasks) openTasks()
  }

  return (
    <div
      className="p-4 border rounded-xl"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <CalendarHeader
        view={view}
        setView={setView}
        currentDate={formatDate()}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />

      <div key={view} className="mt-4">
        {view === "day" && (
          <DayView
            selectedDate={selectedDate}
            onSelect={handleSelect}
          />
        )}

        {view === "week" && (
          <WeekView
            selectedDate={selectedDate}
            onSelect={handleSelect}
          />
        )}

        {view === "month" && (
          <MonthView
            selectedDate={selectedDate}
            onSelect={handleSelect}
            currentDate={date}
          />

        )}
      </div>
    </div>
  )
}

export default Calendar
