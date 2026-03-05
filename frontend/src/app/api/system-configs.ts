import request from "./request"

export const systemConfigsApi = {
  getList: (category?: string) => request.get("/system-configs", { params: { category } }),
  update: (id: number, configValue: string) => request.put(`/system-configs/${id}`, { config_value: configValue }),
  batchUpdate: (configs: Array<{ id: number; config_value: string }>) => request.put("/system-configs/batch", { configs })
}
