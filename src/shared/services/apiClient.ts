import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: any) => {
        console.error('API Error:', error)
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config)
  }
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = 'd28116c08a9d8b5f31b6c094b3519ba9'

export const apiClient = new ApiClient(TMDB_BASE_URL)

export const getImageUrl = (path: string, size: 'w500' | 'original' | 'w780' = 'w500'): string => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : ''
}

export { TMDB_API_KEY }
export default apiClient
