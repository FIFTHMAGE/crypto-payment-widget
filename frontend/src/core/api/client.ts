import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { config } from '../config'
import { logger } from '../logger'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = localStorage.getItem('api_key')
        if (apiKey && config.headers) {
          config.headers['X-API-Key'] = apiKey
        }

        const requestId = this.generateRequestId()
        if (config.headers) {
          config.headers['X-Request-ID'] = requestId
        }

        logger.debug('API Request', {
          method: config.method,
          url: config.url,
          requestId,
        })

        return config
      },
      (error) => {
        logger.error('Request Error', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        })
        return response
      },
      (error: AxiosError) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      // Server responded with error
      logger.error('API Error Response', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      })

      if (error.response.status === 401) {
        // Handle unauthorized
        this.handleUnauthorized()
      } else if (error.response.status === 429) {
        // Handle rate limit
        logger.warn('Rate limit exceeded')
      }
    } else if (error.request) {
      // Request made but no response
      logger.error('API No Response', {
        url: error.config?.url,
      })
    } else {
      // Request setup error
      logger.error('API Request Setup Error', error.message)
    }
  }

  private handleUnauthorized() {
    localStorage.removeItem('api_key')
    // Optionally redirect to login or show modal
    logger.warn('Unauthorized access - API key removed')
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('api_key', apiKey)
    this.client.defaults.headers.common['X-API-Key'] = apiKey
  }

  clearApiKey() {
    localStorage.removeItem('api_key')
    delete this.client.defaults.headers.common['X-API-Key']
  }
}

export const apiClient = new ApiClient()

