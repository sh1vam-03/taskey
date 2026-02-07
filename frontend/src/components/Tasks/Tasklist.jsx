import TaskItem from "./Taskitem"

const TaskList = ({
  tasks,
  selectedIds,
  setSelectedIds,
  onDelete,
  onToggle,
  onUpdate,
}) => {
  if (!tasks.length) {
    return <p className="opacity-70">No tasks found</p>
  }

   const handleComplete = (taskId) => {
    // update task locally
    // then UI auto-refreshes because date didn't change
  }

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(tasks.map((t) => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length

  return (
    <>
      {/* Select All */}
      <label className="flex items-center gap-2 mb-3 text-sm">
        <input 
          type="checkbox"
          checked={allSelected}
          onChange={(e) => toggleSelectAll(e.target.checked)}
        />
        Select all
      </label>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedIds.includes(task.id)}
            onSelect={(checked) =>
              setSelectedIds((prev) =>
                checked
                  ? [...prev, task.id]
                  : prev.filter((id) => id !== task.id)
              )
            }
            onDelete={onDelete}
            onToggle={onToggle}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </>
  )
}

export default TaskList
