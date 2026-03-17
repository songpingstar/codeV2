import request from "./request"

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export const scriptCategoriesApi = {
  getList: () => request.get<Category[]>("/script-categories"),
  create: (data: any) => request.post<Category>("/script-categories", data),
  update: (id: number, data: any) => request.put<Category>(`/script-categories/${id}`, data),
  delete: (id: number) => request.delete(`/script-categories/${id}`)
}