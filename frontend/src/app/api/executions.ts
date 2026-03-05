import request from "./request"

export const executionsApi = {
  getList: (params: any) => request.get("/executions", { params }),
  search: (keyword: string, params: any) => request.get("/executions/search", { params: { keyword, ...params } }),
  getStats: () => request.get("/executions/stats"),
  getLogs: (executionId: string, nodeId: number) => request.get(`/executions/${executionId}/logs`, { params: { node_id: nodeId } }),
  downloadLogs: (executionId: string, nodeId: number, format = "txt") => request.get(`/executions/${executionId}/logs/download`, { 
    params: { node_id: nodeId, format },
    responseType: 'blob'
  }),
  getDetail: (executionId: string) => request.get(`/executions/${executionId}`)
}