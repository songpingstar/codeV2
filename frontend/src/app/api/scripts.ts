import request from "./request"

export const scriptsApi = {
  getList: (params: any) => request.get("/scripts", { params }),
  search: (keyword: string, params: any) => request.get("/scripts/search", { params: { keyword, ...params } }),
  create: (data: any) => request.post("/scripts", data),
  update: (id: number, data: any) => request.put(`/scripts/${id}`, data),
  delete: (id: number) => request.delete(`/scripts/${id}`),
  getDetail: (id: number) => request.get(`/scripts/${id}`),
  execute: (id: number, data: any) => request.post(`/scripts/${id}/execute`, data)
}