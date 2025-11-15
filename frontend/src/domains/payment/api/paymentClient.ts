import { apiClient } from '../../../core/api/client'
import type {
  Payment,
  PaymentRequest,
  PaymentResponse,
  ProcessPaymentParams,
} from '../types'

class PaymentApiClient {
  private readonly basePath = '/payments'

  async createPayment(params: ProcessPaymentParams): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>(
      `${this.basePath}`,
      params
    )
    return response.data
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(
      `${this.basePath}/${paymentId}`
    )
    return response.data
  }

  async listPayments(params?: {
    limit?: number
    offset?: number
    status?: string
  }): Promise<{ payments: Payment[]; total: number }> {
    const response = await apiClient.get<{
      payments: Payment[]
      total: number
    }>(`${this.basePath}`, { params })
    return response.data
  }

  async cancelPayment(paymentId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${paymentId}`)
  }

  async refundPayment(
    paymentId: string,
    reason?: string
  ): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>(
      `${this.basePath}/${paymentId}/refund`,
      { reason }
    )
    return response.data
  }

  async getPaymentStatus(paymentId: string): Promise<{
    status: string
    txHash?: string
    confirmations?: number
  }> {
    const response = await apiClient.get(
      `${this.basePath}/${paymentId}/status`
    )
    return response.data
  }
}

export const paymentApiClient = new PaymentApiClient()

