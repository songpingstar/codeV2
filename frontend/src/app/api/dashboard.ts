import request from "./request"

export const dashboardApi = {
  getStats: () => request.get("/dashboard/stats"),
  getScriptDistribution: () => request.get("/dashboard/script-distribution"),
  getTaskStats: () => request.get("/dashboard/task-stats"),
  getRecentExecutions: (limit = 5) => request.get("/dashboard/recent-executions", { params: { limit } })
}