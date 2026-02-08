import React from "react"

const VIEWS = ["day", "week", "month"]

const CalendarHeader = ({
  view,
  setView,
  currentDate,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      style={{ color: "var(--text)" }}
    >
      {/* LEFT: Date label + navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          className="px-3 py-2 border rounded-lg hover:opacity-80 cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        >
          ◀
        </button>

        <button
          onClick={onToday}
          className="px-3 py-2 border rounded-lg text-sm hover:opacity-80 cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        >
          Today
        </button>

        <button
          onClick={onNext}
          className="px-3 py-2 border rounded-lg hover:opacity-80 cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        >
          ▶
        </button>

        <span className="ml-3 font-semibold">
          {currentDate}
        </span>
      </div>

      {/* RIGHT: View switcher */}
      <div
        className="flex rounded-lg overflow-hidden border"
        style={{ borderColor: "var(--border)" }}
      >
        {VIEWS.map((v) => (
          <button
            key={v} // ✅ FIXED KEY WARNING
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm transition cursor-pointer ${
              view === v
                ? "bg-black text-white"
                : "hover:opacity-70"
            }`}
            style={
              view !== v
                ? { backgroundColor: "var(--card)" }
                : {}
            }
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CalendarHeader
