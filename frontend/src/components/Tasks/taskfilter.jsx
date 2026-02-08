const TaskFilters = () => (
  <div className="flex gap-3">
    <select className="border p-2 rounded">
      <option>All</option>
      <option>Completed</option>
      <option>Pending</option>
    </select>
  </div>
)

export default TaskFilters
