const MonthlyCalendar = ({ days }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
      {Object.entries(days).map(([date, stats]) => {
        const isPerfect =
          stats.total > 0 && stats.missed === 0 && stats.pending === 0

        return (
          <div
            key={date}
            className={`border rounded-lg p-3 text-sm transition ${
              isPerfect ? "font-medium" : "opacity-80"
            }`}
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="mb-1 text-xs opacity-70">
              {date.split("-")[2]}
            </p>

            <p>Total: {stats.total}</p>
            <p>✔ {stats.completed}</p>
            <p>✖ {stats.missed}</p>
          </div>
        )
      })}
    </div>
  )
}

export default MonthlyCalendar
