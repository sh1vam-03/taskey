import dayjs from "dayjs"

const WeekView = ({ selectedDate, onSelect }) => {
  const start = dayjs(selectedDate || dayjs()).startOf("week")
  const today = dayjs().format("YYYY-MM-DD")

  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => {
        const day = start.add(i, "day")
        const date = day.format("YYYY-MM-DD")

        const isToday = date === today
        const isSelected = date === selectedDate

        return (
<div
            key={date}
            onClick={() => onSelect(date)}
            className={`
              p-3 border rounded text-center cursor-pointer transition
              ${isSelected ? "bg-black text-white" : ""}
              ${isToday && !isSelected ? "ring-2 ring-black" : ""}
            `}
          >
        
            <p className="text-xs opacity-60">{day.format("ddd")}</p>
            <p className="font-medium">{day.format("D")}</p>
           

          </div>
            
        )
      })}
    </div>
  )
}

export default WeekView
