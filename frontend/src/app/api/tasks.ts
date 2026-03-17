import request from "./request"

export interface Task {
  id: number;
  name: string;
  script_id: number;
  script_name?: string;
  cron_expression: string;
  cron_description?: string;
  next_run_time?: string;
  environment: string;
  execution_mode: string;
  target_nodes?: number[];
  target_node_names?: string;
  enabled: boolean;
  last_run_time?: string;
  last_run_status?: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskStats {
  total: number;
  enabled: number;
  disabled: number;
  manual_runs: number;
  triggered_runs: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export const tasksApi = {
  getList: (params: any) => request.get<PaginatedResponse<Task>>("/scheduled-tasks", { params }),
  search: (keyword: string, params: any) => request.get<PaginatedResponse<Task>>("/scheduled-tasks/search", { params: { keyword, ...params } }),
  getStats: () => request.get<TaskStats>("/scheduled-tasks/stats"),
  create: (data: any) => request.post<Task>("/scheduled-tasks", data),
  update: (id: number, data: any) => request.put<Task>(`/scheduled-tasks/${id}`, data),
  delete: (id: number) => request.delete(`/scheduled-tasks/${id}`),
  toggle: (id: number, enabled: boolean) => request.put(`/scheduled-tasks/${id}/toggle`, { enabled }),
  parseCron: (cronExpression: string) => request.post("/scheduled-tasks/parse-cron", { cron_expression: cronExpression }),
  getAvailableNodes: (environment: string) => request.get("/scheduled-tasks/available-nodes", { params: { environment } })
}
