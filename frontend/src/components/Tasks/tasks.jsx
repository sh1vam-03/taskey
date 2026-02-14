import { useState } from "react"
import { useTasks } from "../../context/Taskscontext"

import TaskItem from "./taskitem"
import TaskForm from "./taskform"
import BulkActions from "./bulkaction"

const Tasks = () => {
  const { tasks, bulkCompleteTasks, selectedDate, bulkUndoTasks } = useTasks()
  const [selectedTasks, setSelectedTasks] = useState([])

  const allSelected =
    tasks.length > 0 && selectedTasks.length === tasks.length

  const selectAll = () => {
    setSelectedTasks(tasks.map((t) => t.id))
  }

  const clearAll = () => {
    setSelectedTasks([])
  }

  const bulkComplete = () => {
  bulkCompleteTasks(selectedTasks)
  setSelectedTasks([])
}

const bulkUndo = () => {
  bulkUndoTasks(selectedTasks)
  setSelectedTasks([])
}




  const visibleTasks = selectedDate
    ? tasks.filter((t) => t.date === selectedDate)
    : tasks

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">
  Tasks {selectedDate && `• ${selectedDate}`}
</h2>


      <TaskForm />

      {/* Select All / Clear All */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm opacity-70">
          {selectedTasks.length > 0 &&
            `${selectedTasks.length} task(s) selected`}
        </p>

        <button
          onClick={allSelected ? clearAll : selectAll}
          className="text-sm font-medium hover:underline"
        >
          {allSelected ? "Clear All" : "Select All"}
        </button>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        count={selectedTasks.length}
        allSelected={allSelected}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        onComplete={bulkComplete}
        onUndo={bulkUndo}
      />

      {/* Task List */}
      <div className="space-y-3 mt-4">
        {visibleTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTasks.includes(task.id)}
          />
        ))}

        {visibleTasks.length === 0 && (
          <p className="opacity-60 text-sm">No tasks</p>
        )}
      </div>
    </>
  )
}

export default Tasks
