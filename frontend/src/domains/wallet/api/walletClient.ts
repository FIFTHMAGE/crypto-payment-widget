import { apiClient } from '../../../core/api/client'
import type {
  WalletBalance,
  TokenBalance,
  WalletTransaction,
  WalletStats,
} from '../types'

class WalletApiClient {
  private readonly basePath = '/wallet'

  async getBalance(address: string): Promise<WalletBalance> {
    const response = await apiClient.get<WalletBalance>(
      `${this.basePath}/${address}/balance`
    )
    return response.data
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const response = await apiClient.get<TokenBalance[]>(
      `${this.basePath}/${address}/tokens`
    )
    return response.data
  }

  async getTransactions(
    address: string,
    params?: {
      limit?: number
      offset?: number
      type?: string
    }
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const response = await apiClient.get<{
      transactions: WalletTransaction[]
      total: number
    }>(`${this.basePath}/${address}/transactions`, { params })
    return response.data
  }

  async getStats(address: string): Promise<WalletStats> {
    const response = await apiClient.get<WalletStats>(
      `${this.basePath}/${address}/stats`
    )
    return response.data
  }

  async validateAddress(address: string): Promise<{ valid: boolean }> {
    const response = await apiClient.post<{ valid: boolean }>(
      `${this.basePath}/validate`,
      { address }
    )
    return response.data
  }

  async resolveENS(name: string): Promise<{ address: string | null }> {
    const response = await apiClient.get<{ address: string | null }>(
      `${this.basePath}/ens/${name}`
    )
    return response.data
  }
}

export const walletApiClient = new WalletApiClient()

