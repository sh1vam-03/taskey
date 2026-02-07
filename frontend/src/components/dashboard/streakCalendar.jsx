const StreakCalendar = ({ calendar }) => {
  return (
    <div>
      <p className="text-sm opacity-70 mb-3">
        Streak Calendar (Last Days)
      </p>

      <div className="grid grid-cols-7 gap-2">
        {Object.entries(calendar).map(([date, isPerfect]) => (
          <div
            key={date}
            title={date}
            className={`h-6 w-6 rounded-sm border transition ${
              isPerfect ? "opacity-100" : "opacity-30"
            }`}
            style={{
              backgroundColor: isPerfect
                ? "var(--text)"
                : "transparent",
              borderColor: "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default StreakCalendar
