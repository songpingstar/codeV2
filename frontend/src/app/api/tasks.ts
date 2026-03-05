import request from "./request"

export const tasksApi = {
  getList: (params: any) => request.get("/scheduled-tasks", { params }),
  search: (keyword: string, params: any) => request.get("/scheduled-tasks/search", { params: { keyword, ...params } }),
  getStats: () => request.get("/scheduled-tasks/stats"),
  create: (data: any) => request.post("/scheduled-tasks", data),
  update: (id: number, data: any) => request.put(`/scheduled-tasks/${id}`, data),
  delete: (id: number) => request.delete(`/scheduled-tasks/${id}`),
  toggle: (id: number, enabled: boolean) => request.put(`/scheduled-tasks/${id}/toggle`, { enabled }),
  parseCron: (cronExpression: string) => request.post("/scheduled-tasks/parse-cron", { cron_expression: cronExpression }),
  getAvailableNodes: (environment: string) => request.get("/scheduled-tasks/available-nodes", { params: { environment } })
}