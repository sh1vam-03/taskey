import { useState } from "react"
import EditTaskModal from "./EditTask"

const TaskItem = ({
  task,
  isSelected,
  onSelect,
  onDelete,
  onToggle,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between border p-4 rounded-md">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />

          <p
            className={`font-medium ${
              task.completedToday ? "line-through opacity-40" : ""
            }`}
          >
            {task.title}
          </p>
        </div>

        <div className="flex gap-3 ">
          <button className=" bg-gray-700 text-white px-2 py-1 rounded-md task-btn cursor-pointer" onClick={() => setIsEditing(true)}>Edit</button>
          <button className=" task-btn cursor-pointer" onClick={() => onToggle(task.id)}>
            {task.completedToday ? "Undo" : "Complete"}
          </button>
          <button className="task-btn task-btn-danger cursor-pointer" onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>

      {isEditing && (
        <EditTaskModal
          task={task}
          onClose={() => setIsEditing(false)}
          onSave={onUpdate}
        />
      )}
    </>
  )
}

export default TaskItem
