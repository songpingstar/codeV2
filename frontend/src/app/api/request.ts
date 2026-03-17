/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PREFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import axios, { AxiosResponse, AxiosRequestConfig } from "axios"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX,
  timeout: 60000
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data.data
  },
  (error) => {
    console.error("API Error:", error)
    return Promise.reject(error)
  }
)

const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.get(url, config) as Promise<T>
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instance.post(url, data, config) as Promise<T>
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instance.put(url, data, config) as Promise<T>
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.delete(url, config) as Promise<T>
  }
}

export default request
