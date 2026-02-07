import { useState } from "react"

export const useTasks = () => {
  const [tasks, setTasks] = useState([])

  const addTask = (task) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        completedToday: false,
        priority: "MEDIUM",
        ...task,
      },
    ])
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completedToday: !t.completedToday } : t
      )
    )
  }

  const updateTask = (id, updates) => {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    )
  )
}


  return {
  tasks,
  addTask,
  deleteTask,
  toggleComplete,
  updateTask,
}
}
