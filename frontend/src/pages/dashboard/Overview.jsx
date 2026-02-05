import StatCard from "../../components/dashboard/Statcard"

const mockOverview = {
  today: {
    totalTasks: 10,
    completedTasks: 5,
    missedTasks: 1,
    pendingTasks: 4,
  },
  streaks: {
    currentStreak: 5,
    longestStreak: 12,
  },
}

const Overview = () => {
  const { today, streaks } = mockOverview

  return (
    <>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--heading)" }}>
        Overview
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Tasks" value={today.totalTasks} />
        <StatCard label="Completed" value={today.completedTasks} />
        <StatCard label="Pending" value={today.pendingTasks} />
        <StatCard label="Missed" value={today.missedTasks} />
      </div>

      <div
        className="border rounded-md p-6"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-lg font-medium mb-2">🔥 Streaks</p>
        <p>Current Streak: <strong>{streaks.currentStreak} days</strong></p>
        <p>Longest Streak: <strong>{streaks.longestStreak} days</strong></p>
      </div>
    </>
  )
}

export default Overview
