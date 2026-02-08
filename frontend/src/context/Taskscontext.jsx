import { createContext, useContext, useState } from "react"

const TasksContext = createContext()

export const TasksProvider = ({ children }) => {
    const [tasks, setTasks] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)

    // CREATE (POST /tasks)
    const addTask = (task) => {
        setTasks(prev => [
            ...prev,
            {
                ...task,
                id: crypto.randomUUID(),
                status: "PENDING",
            },
        ])
    }

    // UPDATE (PUT /tasks/:id)
    const updateTask = (id, updates) => {
        setTasks(prev =>
            prev.map(t => (t.id === id ? { ...t, ...updates } : t))
        )
    }

    // DELETE (DELETE /tasks/:id)
    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    // COMPLETE (POST /:id/complete)
    const completeTask = (id) => {
        setTasks(prev =>
            prev.map(t =>
                t.id === id ? { ...t, status: "COMPLETED" } : t
            )
        )
    }

    // UNDO COMPLETE (DELETE /:id/completed)
    const undoComplete = (id) => {
        setTasks(prev =>
            prev.map(t =>
                t.id === id ? { ...t, status: "PENDING" } : t
            )
        )
    }

    const [streakOverview] = useState({
        currentStreak: 5,
        longestStreak: 12,
        isActive: true,
    })

    const [streakCalendar] = useState({
        "2023-12-23": true,
        "2023-12-24": false,
        "2023-12-25": true,
    })

    const bulkCompleteTasks = (taskIds) => {
  setTasks((prev) =>
    prev.map((task) =>
      taskIds.includes(task.id)
        ? { ...task, status: "COMPLETED" }
        : task
    )
  )
}

const bulkUndoTasks = (taskIds) => {
  setTasks((prev) =>
    prev.map((task) =>
      taskIds.includes(task.id)
        ? { ...task, status: "PENDING" }
        : task
    )
  )
}



    return (
        <TasksContext.Provider
            value={{
                tasks,
                selectedDate,
                setSelectedDate,
                addTask,
                updateTask,
                deleteTask,
                completeTask,
                undoComplete,
                streakOverview,
                streakCalendar,
                bulkCompleteTasks,
                bulkUndoTasks,
            }}
        >
            {children}
        </TasksContext.Provider>
    )
}

export const useTasks = () => useContext(TasksContext)
