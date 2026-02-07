import StatCard from "./Statcard"

const MonthlySummary = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <StatCard label="Total" value={summary.total} />
      <StatCard label="Completed" value={summary.completed} />
      <StatCard label="Missed" value={summary.missed} />
      <StatCard label="Pending" value={summary.pending} />
      <StatCard
        label="Completion"
        value={`${summary.completionRate}%`}
      />
    </div>
  )
}

export default MonthlySummary
