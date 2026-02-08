const getMeterColor = (value) => {
  if (value <= 40) return "#ef4444"   // red
  if (value <= 70) return "#f59e0b"   // yellow
  return "#22c55e"                    // green
}

const StreakMeter = ({ value = 0, label }) => {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset =
    circumference - (value / 100) * circumference

  // 🔥 Needle angle
  const angle = (value / 100) * 240 - 120
  const color = getMeterColor(value)

  return (
    <div
      className="p-6 border rounded-2xl flex flex-col items-center w-full max-w-xs mx-auto"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          {/* Background circle */}
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress arc */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease",
            }}
          />
        </svg>

        {/* 🔥 NEEDLE */}
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{
            width: "2px",
            height: "55px",
            backgroundColor: color,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transition: "transform 0.8s ease",
          }}
        />

        {/* Needle center */}
        <div
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
          style={{
            backgroundColor: color,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Value */}
      <div className="mt-3 text-center">
        <p className="text-3xl font-bold">
          {value}%
        </p>
        <p className="text-sm opacity-70">
          {label}
        </p>
      </div>
    </div>
  )
}

export default StreakMeter
