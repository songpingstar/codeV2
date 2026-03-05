import request from "./request"

export const scriptCategoriesApi = {
  getList: () => request.get("/script-categories"),
  create: (data: any) => request.post("/script-categories", data),
  update: (id: number, data: any) => request.put(`/script-categories/${id}`, data),
  delete: (id: number) => request.delete(`/script-categories/${id}`)
}