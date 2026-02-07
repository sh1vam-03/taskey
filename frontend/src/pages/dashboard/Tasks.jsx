import { useState } from "react"
import TaskForm from "../../components/tasks/TaskForm"
import TaskList from "../../components/tasks/TaskList"
import TaskFilters from "../../components/tasks/TaskFilters"
import BulkActions from "../../components/tasks/BulkActions"
import { useTasks } from "../../hooks/useTasks"

const Tasks = () => {
const { tasks, addTask, deleteTask, toggleComplete, updateTask } = useTasks()


  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
  })

  const [selectedIds, setSelectedIds] = useState([])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(filters.search.toLowerCase())

    const matchesPriority =
      !filters.priority || task.priority === filters.priority

    const matchesStatus =
      !filters.status ||
      (filters.status === "completed" && task.completedToday) ||
      (filters.status === "pending" && !task.completedToday)

    return matchesSearch && matchesPriority && matchesStatus
  })

  const bulkComplete = () => {
    selectedIds.forEach(toggleComplete)
    setSelectedIds([])
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>

      <TaskForm onCreate={addTask} />
      <TaskFilters filters={filters} setFilters={setFilters} />

      {selectedIds.length > 0 && (
        <BulkActions
          count={selectedIds.length}
          onComplete={bulkComplete}
          onClear={() => setSelectedIds([])}
        />
      )}

      <TaskList
  tasks={filteredTasks}
  selectedIds={selectedIds}
  setSelectedIds={setSelectedIds}
  onDelete={deleteTask}
  onToggle={toggleComplete}
  onUpdate={updateTask}
/>

    </main>
  )
}

export default Tasks
