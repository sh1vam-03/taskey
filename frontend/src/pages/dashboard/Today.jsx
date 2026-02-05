import StatCard from "../../components/dashboard/Statcard"

const mockToday = {
  stats: { total: 5, completed: 2, missed: 0, pending: 3 },
  timeline: [
    {
      title: "Morning Meeting",
      type: "SCHEDULED",
      startTime: "09:00",
      endTime: "10:00",
      status: "COMPLETED",
    },
    {
      title: "Check Emails",
      type: "UNSCHEDULED",
      status: "PENDING",
    },
  ],
}

const Today = () => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--heading)" }}>
        Today
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={mockToday.stats.total} />
        <StatCard label="Completed" value={mockToday.stats.completed} />
        <StatCard label="Pending" value={mockToday.stats.pending} />
        <StatCard label="Missed" value={mockToday.stats.missed} />
      </div>

      <div className="space-y-4">
        {mockToday.timeline.map((item, i) => (
          <div
            key={i}
            className="border rounded-md p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="font-medium">{item.title}</p>
            <p className="text-sm opacity-70">
              {item.type === "SCHEDULED"
                ? `${item.startTime} - ${item.endTime}`
                : "No scheduled time"}
            </p>
            <p>Status: <strong>{item.status}</strong></p>
          </div>
        ))}
      </div>
    </>
  )
}

export default Today
