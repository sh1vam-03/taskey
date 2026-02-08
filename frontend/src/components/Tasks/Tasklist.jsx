import TaskItem from "./Task/taskitem" 

const TaskList = ({ tasks, selectedTasks, onToggleSelect }) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          selected={selectedTasks.includes(task.id)}
          onSelect={() => onToggleSelect(task.id)}
        />
      ))}
    </div>
  )
}

export default TaskList
