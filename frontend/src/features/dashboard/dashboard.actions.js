import dashboardService from "@/services/dashboard.services"

export const fetchDashboardOverview = async () => {
    return await dashboardService.getOverview()
}

export const fetchTodayDashboard = async () => {
    return await dashboardService.getTodayDashboard()
}

export const fetchWeeklyDashboard = async () => {
    return await dashboardService.getWeeklyDashboard()
}

export const fetchMonthlyDashboard = async () => {
    return await dashboardService.getMonthlyDashboard()
}

export const fetchStreakOverview = async () => {
    return await dashboardService.getStreaks()
}
