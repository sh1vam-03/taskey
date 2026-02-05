const StatCard = ({ label, value }) => {
  return (
    <div
      className="border rounded-md p-5"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default StatCard
