import WeeklySummary from "../../components/dashboard/WeeklySummary"
import WeeklyDays from "../../components/dashboard/WeeklyDays"

const Weekly = () => {
  // frontend-only sample data (API-ready)
  const weeklyData = {
    weekStart: "2023-12-25",
    weekEnd: "2023-12-31",
    summary: {
      total: 50,
      completed: 40,
      missed: 5,
      pending: 5,
      completionRate: 80,
    },
    days: {
      "Mon": { total: 10, completed: 8, missed: 1, pending: 1 },
      "Tue": { total: 8, completed: 8, missed: 0, pending: 0 },
      "Wed": { total: 7, completed: 5, missed: 1, pending: 1 },
      "Thu": { total: 6, completed: 5, missed: 1, pending: 0 },
      "Fri": { total: 9, completed: 7, missed: 1, pending: 1 },
      "Sat": { total: 5, completed: 4, missed: 1, pending: 0 },
      "Sun": { total: 5, completed: 3, missed: 0, pending: 2 },
    },
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">
        Weekly Overview
      </h1>

      <p className="text-sm opacity-70 mb-6">
        {weeklyData.weekStart} → {weeklyData.weekEnd}
      </p>

      <WeeklySummary summary={weeklyData.summary} />
      <WeeklyDays days={weeklyData.days} />
    </main>
  )
}

export default Weekly
