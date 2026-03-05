import request from "./request"

export const agentApi = {
  register: (data: any) => request.post("/agent/register", data),
  heartbeat: (data: any) => request.post("/agent/heartbeat", data),
  getTasks: (nodeId: number, nodeToken: string) => request.get("/agent/tasks", { params: { node_id: nodeId, node_token: nodeToken } }),
  reportResult: (executionId: string, data: any) => request.post(`/agent/tasks/${executionId}/result`, data)
}