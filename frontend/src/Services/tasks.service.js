import api from "./api"

// CREATE TASK
export const createTask = (data) => api.post("/tasks", data)

// GET TASKS
export const getTasks = (params) => api.get("/tasks", { params })

// UPDATE TASK
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)

// DELETE TASK
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

// COMPLETE TASK
export const completeTask = (id, date) =>
  api.post(`/tasks/${id}/complete`, { date })

// UNDO COMPLETE
export const undoCompleteTask = (id, date) =>
  api.delete(`/tasks/${id}/completed`, { data: { date } })

// Get completion history
export const getCompletionHistory = (id) =>
  api.get(`/tasks/${id}/completed-history`)

// Bulk complete
export const bulkCompleteTasks = (taskIds, date) =>
  api.post("/tasks/complete-bulk", { taskIds, date })


