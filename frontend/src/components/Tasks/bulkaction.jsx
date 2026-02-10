const BulkActions = ({
  count,
  allSelected,
  onSelectAll,
  onClearAll,
  onComplete,
    onUndo,
}) => {
  if (count === 0) return null

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 p-4 border rounded-xl"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <p className="font-medium">
        {count} task{count > 1 ? "s" : ""} selected
      </p>

      <div className="flex gap-2">
        {!allSelected ? (
          <button
            onClick={onSelectAll}
            className="px-3 py-2 border rounded-lg hover:opacity-80 cursor-pointer"
          >
            Select All
          </button>
        ) : (
          <button
            onClick={onClearAll}
            className="px-3 py-2  rounded-lg hover:opacity-80 cursor-pointer"
          >
            Clear All
          </button>
        )}

        <button
          onClick={onComplete}
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80 transition cursor-pointer"
        >
          Complete Selected
        </button>

         <button
          onClick={onUndo}
          className="px-4 py-2 bg-black text-white  rounded-lg hover:opacity-80 cursor-pointer"
        >
          Undo
        </button>
      </div>
    </div>
  )
}

export default BulkActions
