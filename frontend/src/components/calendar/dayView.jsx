const DayView = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border flex justify-between"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div>
            <p className="font-medium">{item.title}</p>
            {item.startTime && (
              <p className="text-xs opacity-60">
                {item.startTime} – {item.endTime}
              </p>
            )}
          </div>

          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor:
                item.status === "COMPLETED"
                  ? "var(--text)"
                  : "transparent",
              color:
                item.status === "COMPLETED"
                  ? "var(--bg)"
                  : "var(--text)",
              border: "1px solid var(--border)",
            }}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  )
}
