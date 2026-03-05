import request from "./request"

export const usersApi = {
  getList: (params: any) => request.get("/users", { params }),
  create: (data: any) => request.post("/users", data),
  update: (id: number, data: any) => request.put(`/users/${id}`, data),
  delete: (id: number) => request.delete(`/users/${id}`),
  resetPassword: (id: number, password: string) => request.put(`/users/${id}/reset-password`, { password }),
  changePassword: (oldPassword: string, newPassword: string) => request.put("/users/me/change-password", { old_password: oldPassword, new_password: newPassword })
}