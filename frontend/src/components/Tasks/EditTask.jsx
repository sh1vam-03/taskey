import { useState } from "react"

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority || "MEDIUM")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(task.id, { title, priority })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          Edit Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Title</label>
            <input
              className="w-full border px-3 py-2 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Priority</label>
            <select
              className="w-full border px-3 py-2 rounded-md bg-black text-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal
