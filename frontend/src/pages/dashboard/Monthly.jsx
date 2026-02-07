import MonthlySummary from "../../components/dashboard/monthlySummary"
import MonthlyCalendar from "../../components/dashboard/monthlyCalendar"

const Monthly = () => {
  // frontend-only (API-ready)
  const monthlyData = {
    month: "2023-12",
    summary: {
      total: 200,
      completed: 150,
      missed: 20,
      pending: 30,
      completionRate: 75,
    },
    days: {
      "2023-12-01": { total: 5, completed: 5, missed: 0, pending: 0 },
      "2023-12-02": { total: 6, completed: 4, missed: 1, pending: 1 },
      "2023-12-03": { total: 4, completed: 3, missed: 1, pending: 0 },
    },
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">
        Monthly Overview
      </h1>

      <p className="text-sm opacity-70 mb-6">
        {monthlyData.month}
      </p>

      <MonthlySummary summary={monthlyData.summary} />
      <MonthlyCalendar days={monthlyData.days} />
    </main>
  )
}

export default Monthly
