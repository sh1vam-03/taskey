import tasksService from "@/services/tasks.service"

export const fetchTasks = async () => {
    return await tasksService.getAll()
}

export const createTask = async (payload) => {
    return await tasksService.create(payload)
}

export const updateTask = async (id, payload) => {
    return await tasksService.update(id, payload)
}

export const deleteTask = async (id) => {
    return await tasksService.delete(id)
}
