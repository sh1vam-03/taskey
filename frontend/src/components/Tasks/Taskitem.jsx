import { useState } from "react"
import { useTasks } from "../../context/Taskscontext"

const TaskItem = ({ task, isSelected }) => {
  const {
    deleteTask,
    completeTask,
    undoComplete,
    updateTask,
  } = useTasks()

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const saveEdit = () => {
    if (!title.trim()) return
    updateTask(task.id, { title })
    setEditing(false)
  }

  return (
    <div
      className={`p-4 border rounded-xl flex justify-between items-center transition ${
        isSelected ? "ring-2 ring-black" : ""
      }`}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        opacity: task.status === "COMPLETED" ? 0.6 : 1,
      }}
    >
      {/* LEFT */}
      <div className="flex-1">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-2 w-full outline-none"
            autoFocus
          />
        ) : (
          <p
            className={`font-medium ${
              task.status === "COMPLETED"
                ? "line-through opacity-70"
                : ""
            }`}
          >
            {task.title}
          </p>
        )}

        {task.status === "COMPLETED" && (
          <span className="text-sm opacity-60 ">Completed</span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 ml-4 text-sm">
        {editing ? (
          <button
            onClick={saveEdit}
            className="hover:underline cursor-pointer"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="hover:underline cursor-pointer"
          >
            Edit
          </button>
        )}

        {task.status === "COMPLETED" ? (
          <button
            onClick={() => undoComplete(task.id)}
            className="hover:underline cursor-pointer"
          >
            Undo
          </button>
        ) : (
          <button
            onClick={() => completeTask(task.id)}
            className="hover:underline cursor-pointer"
          >
            Complete
          </button>
        )}

        <button
          onClick={() => deleteTask(task.id)}
          className="hover:underline text-red-600 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default TaskItem
