import type {
  Payment,
  TransactionResponse,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from '../lib/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from '../lib/constants'

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      }
    }
  }

  async logTransaction(transaction: Partial<Payment>): Promise<TransactionResponse> {
    const response = await this.request<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS,
      {
        method: 'POST',
        body: JSON.stringify(transaction),
      }
    )

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to log transaction',
      }
    }

    return response.data
  }

  async getTransactions(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<Payment>> {
    const { limit = 50, offset = 0 } = params
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const response = await this.request<{
      transactions: Payment[]
      total: number
    }>(`${API_ENDPOINTS.TRANSACTIONS}?${queryParams}`)

    if (!response.success || !response.data) {
      return {
        items: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      }
    }

    return {
      items: response.data.transactions,
      total: response.data.total,
      limit,
      offset,
      hasMore: offset + limit < response.data.total,
    }
  }

  async getTransaction(txHash: string): Promise<Payment | null> {
    const response = await this.request<{ transaction: Payment }>(
      API_ENDPOINTS.TRANSACTION_BY_HASH(txHash)
    )

    return response.success && response.data ? response.data.transaction : null
  }

  async verifyTransaction(txHash: string): Promise<Payment | null> {
    const response = await this.request<{ transaction: Payment }>(
      API_ENDPOINTS.VERIFY_TRANSACTION(txHash),
      { method: 'POST' }
    )

    return response.success && response.data ? response.data.transaction : null
  }

  async checkHealth(): Promise<boolean> {
    const response = await this.request<{ status: string }>(
      API_ENDPOINTS.HEALTH
    )
    return response.success && response.data?.status === 'ok'
  }
}

export const apiService = new ApiService()

