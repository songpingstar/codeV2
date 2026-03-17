import request from "./request"

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
  };
  permissions: string[];
}

export const authApi = {
  login: (username: string, password: string) => request.post<LoginResponse>("/auth/login", { username, password }),
  logout: () => request.post("/auth/logout"),
  refreshToken: (refreshToken: string) => request.post("/auth/refresh", { refresh_token: refreshToken }),
  getMe: () => request.get("/auth/me")
}
