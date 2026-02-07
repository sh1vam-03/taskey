const StatCard = ({ label, value }) => {
  return (
    <div
      className="border rounded-lg p-4 text-center"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-xl font-semibold mt-1">
        {value}
      </p>
    </div>
  )
}

export default StatCard
