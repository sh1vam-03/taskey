import dayjs from "dayjs"

const MonthView = ({ selectedDate, onSelect }) => {
    const start = dayjs().startOf("month")
    const days = Array.from(
        { length: start.daysInMonth() },
        (_, i) => start.add(i, "day")
    )

    const today = dayjs().format("YYYY-MM-DD")

    return (
        <div className="grid grid-cols-7 gap-2 text-sm">
            {days.map((day) => {
                const date = day.format("YYYY-MM-DD")

                const isToday = date === today
                const isSelected = date === selectedDate

                return (
                    <div
                        key={date}
                        onClick={() => onSelect(date)}
                        className={`
              p-2 rounded cursor-pointer text-center border transition
              ${isSelected ? "bg-black text-white dark:bg-black dark:text-white" : ""}
                ${isToday && !isSelected ? "ring-2 " : ""}
                  style={{
    ringColor: "var(--ring)",
  }}

              ${!isSelected ? "hover:bg-gray-700 dark:hover:bg-gray-500" : ""}
            `}
          >
                { day.format("D") }
          </div>
    )
})}
    </div >
  )
}

export default MonthView
