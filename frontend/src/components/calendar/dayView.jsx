import dayjs from "dayjs"

const DayView = ({ selectedDate }) => {
  const today = dayjs().format("YYYY-MM-DD")
  const isToday = selectedDate === today

  return (
    <div
      className={`p-6 border rounded text-center ${
        isToday ? "ring-2 ring-black dark:ring-white" : ""
      }  cursor-pointer`}
    >
      <p className="text-sm opacity-60">
        {isToday ? "Today" : "Selected Day"}
      </p>
      <h3 className="text-xl font-semibold mt-1">
        {selectedDate || today}
      </h3>
    </div>
  )
}

export default DayView
