const TaskFilters = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 ">
      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={filters.search}
        onChange={(e) =>
          setFilters({ ...filters, search: e.target.value })
        }
        className="flex-1 border border-gray-300 px-3 py-2 rounded-md outline-none task-search"
      />

      {/* Priority */}
      <div className=" task-select-wrapper">
        <select
        value={filters.priority}
        onChange={(e) =>
          setFilters({ ...filters, priority: e.target.value })
        }
        className=" task-select"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      </div>
      

      {/* Status */}
      <div className=" task-select-wrapper">
        <select
        value={filters.status}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value })
        }
        className=" task-select"
      >
        <option value="">All Tasks</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>
      </div>
      
    </div>
  )
}

export default TaskFilters
