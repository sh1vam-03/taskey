const MonthView = ({ days, selectedDate, setSelectedDate }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
        {days.map(date => (
        <div
          key={date}
          onClick={() => onSelectDate(date)}
          className="cursor-pointer"
        >
          {date}
        </div>
      ))}
      {Object.entries(days).map(([date, tasks]) => (
        <div
          key={date}
          className="min-h-[80px] p-2 border rounded"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <p className="text-xs opacity-60">{date.split("-")[2]}</p>

          {tasks.length > 0 && (
            <span className="text-xs mt-1 inline-block opacity-80">
              {tasks.length} task{tasks.length > 1 && "s"}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
