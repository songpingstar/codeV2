import request from "./request"

export const authApi = {
  login: (username: string, password: string) => request.post("/auth/login", { username, password }),
  logout: () => request.post("/auth/logout"),
  refreshToken: (refreshToken: string) => request.post("/auth/refresh", { refresh_token: refreshToken }),
  getMe: () => request.get("/auth/me")
}