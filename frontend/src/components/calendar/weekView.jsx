const WeekView = ({ days }) => {
  return (
    <div className="grid grid-cols-7 gap-3">
      {Object.entries(days).map(([date, tasks]) => (
        <div key={date} className="space-y-2">
          <p className="text-xs opacity-60">{date}</p>

          {tasks.map((task, i) => (
            <div
              key={i}
              className="p-2 text-sm rounded border"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {task.title}
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-xs opacity-40">No tasks</p>
          )}
        </div>
      ))}
    </div>
  )
}
