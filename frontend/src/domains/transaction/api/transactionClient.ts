import { apiClient } from '../../../core/api/client'
import type {
  Transaction,
  TransactionReceipt,
  TransactionListParams,
  TransactionSearchParams,
} from '../types'

class TransactionApiClient {
  private readonly basePath = '/transactions'

  async getTransaction(txHash: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(
      `${this.basePath}/${txHash}`
    )
    return response.data
  }

  async listTransactions(
    params?: TransactionListParams
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await apiClient.get<{
      transactions: Transaction[]
      total: number
    }>(`${this.basePath}`, { params })
    return response.data
  }

  async searchTransactions(
    params: TransactionSearchParams
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await apiClient.post<{
      transactions: Transaction[]
      total: number
    }>(`${this.basePath}/search`, params)
    return response.data
  }

  async getReceipt(txHash: string): Promise<TransactionReceipt> {
    const response = await apiClient.get<TransactionReceipt>(
      `${this.basePath}/${txHash}/receipt`
    )
    return response.data
  }

  async estimateGas(params: {
    to: string
    from?: string
    value?: string
    data?: string
  }): Promise<{ gasEstimate: string; gasPriceGwei: string }> {
    const response = await apiClient.post<{
      gasEstimate: string
      gasPriceGwei: string
    }>(`${this.basePath}/estimate-gas`, params)
    return response.data
  }

  async cancelTransaction(txHash: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `${this.basePath}/${txHash}/cancel`
    )
    return response.data
  }

  async speedUpTransaction(
    txHash: string,
    newGasPrice: string
  ): Promise<{ newTxHash: string }> {
    const response = await apiClient.post<{ newTxHash: string }>(
      `${this.basePath}/${txHash}/speed-up`,
      { newGasPrice }
    )
    return response.data
  }
}

export const transactionApiClient = new TransactionApiClient()

