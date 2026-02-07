const WeeklyDays = ({ days }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
      {Object.entries(days).map(([day, stats]) => (
        <div
          key={day}
          className="border rounded-lg p-4"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <p className="font-medium mb-2">{day}</p>

          <div className="text-sm space-y-1 opacity-80">
            <p>Total: {stats.total}</p>
            <p>Completed: {stats.completed}</p>
            <p>Missed: {stats.missed}</p>
            <p>Pending: {stats.pending}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WeeklyDays
