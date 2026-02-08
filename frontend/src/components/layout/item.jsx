const Item = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg transition cursor-pointer hover:opacity-80"
      style={{
        backgroundColor: active ? "var(--card)" : "transparent",
        color: "var(--text)",
      }}
    >
      {label}
    </button>
  )
}

export default Item
