import { useState } from "react"

const TaskForm = ({ onCreate }) => {
  const [title, setTitle] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title) return

    onCreate({ title })
    setTitle("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
      <input
        className="flex-1 border border-gray-300 px-3 py-2 rounded-md outline-none"
        placeholder="Add new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="px-4 py-2 border rounded-md bg-black text-white cursor-pointer task-btn">Add</button>
    </form>
  )
}

export default TaskForm
