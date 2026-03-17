import request from "./request"

export interface Script {
  id: number;
  name: string;
  description: string;
  type: 'Python' | 'Shell' | 'Go';
  category_id: number;
  category?: string;
  category_name?: string;
  maintainer: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  updateTime?: string;
}

export const scriptsApi = {
  getList: (params: any) => request.get<{ items: Script[]; total: number }>("/scripts", { params }),
  search: (keyword: string, params: any) => request.get<{ items: Script[]; total: number }>("/scripts/search", { params: { keyword, ...params } }),
  create: (data: any) => request.post<Script>("/scripts", data),
  update: (id: number, data: any) => request.put<Script>(`/scripts/${id}`, data),
  delete: (id: number) => request.delete(`/scripts/${id}`),
  getDetail: (id: number) => request.get<Script>(`/scripts/${id}`),
  execute: (id: number, data: any) => request.post(`/scripts/${id}/execute`, data)
}