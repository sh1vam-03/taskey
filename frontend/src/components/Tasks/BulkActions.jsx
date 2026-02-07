const BulkActions = ({ count, onComplete, onClear }) => {
  return (
    <div className="mb-4 flex items-center justify-between border p-3 rounded-md">
      <p className="text-sm">
        {count} task{count > 1 ? "s" : ""} selected
      </p>

      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="px-3 py-1 border rounded-md task-btn"
        >
          Complete All
        </button>

        <button
          onClick={onClear}
          className="px-3 py-1 border rounded-md task-btn-danger"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default BulkActions
