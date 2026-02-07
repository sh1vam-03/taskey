const StreakOverview = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div
        className="border rounded-lg p-4"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <p className="text-sm opacity-70">🔥 Current Streak</p>
        <p className="text-2xl font-semibold mt-1">
          {data.currentStreak} days
        </p>
      </div>

      <div
        className="border rounded-lg p-4"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <p className="text-sm opacity-70">🏆 Longest Streak</p>
        <p className="text-2xl font-semibold mt-1">
          {data.longestStreak} days
        </p>
      </div>
    </div>
  )
}

export default StreakOverview
