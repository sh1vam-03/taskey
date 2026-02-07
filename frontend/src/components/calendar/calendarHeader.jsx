const CalendarHeader = ({ view, setView }) => {
  return (
    <div className="flex gap-2 mb-6">
      {["day", "week", "month"].map(v => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-4 py-2 rounded border ${
            view === v ? "opacity-100" : "opacity-60"
          }`}
          style={{ borderColor: "var(--border)" }}
        >
          {v.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
