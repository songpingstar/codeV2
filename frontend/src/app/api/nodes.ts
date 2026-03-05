import request from "./request"

export const nodesApi = {
  getList: (params: any) => request.get("/nodes", { params }),
  search: (keyword: string, params: any) => request.get("/nodes/search", { params: { keyword, ...params } }),
  getStats: () => request.get("/nodes/stats"),
  create: (data: any) => request.post("/nodes", data),
  update: (id: number, data: any) => request.put(`/nodes/${id}`, data),
  delete: (id: number) => request.delete(`/nodes/${id}`),
  getDetail: (id: number) => request.get(`/nodes/${id}`),
  getExecutions: (id: number, params: any) => request.get(`/nodes/${id}/executions`, { params })
}