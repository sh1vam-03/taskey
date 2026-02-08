import { useState } from "react"
import { useTasks } from "../../context/Taskscontext"

const TaskForm = () => {
  const { addTask, selectedDate } = useTasks()
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("MEDIUM")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title) return

    addTask({
      title,
      priority,
      date: selectedDate || new Date().toISOString().slice(0, 10),
    })

    setTitle("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add task..."
        className="flex-1 border rounded px-3 py-2"
      />

      <select
        value={priority}
        onChange={e => setPriority(e.target.value)}
        className="border rounded px-2 cursor-pointer"
      >
        <option>LOW</option>
        <option>MEDIUM</option>
        <option>HIGH</option>
      </select>

      <button className="px-4 py-2 border rounded bg-black text-white cursor-pointer">
        Add
      </button>
    </form>
  )
}

export default TaskForm
