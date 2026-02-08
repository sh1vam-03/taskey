const StatsCard = ({ label, value }) => (
  <div
    className="p-5 rounded-lg border"
    style={{
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    }}
  >
    <p className="text-sm opacity-70">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
)

export default StatsCard
