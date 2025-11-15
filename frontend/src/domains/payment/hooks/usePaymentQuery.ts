import { useQuery } from '@tanstack/react-query'
import { paymentApiClient } from '../api'
import type { Payment } from '../types'

export function usePaymentQuery(paymentId: string | undefined) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentApiClient.getPayment(paymentId!),
    enabled: !!paymentId,
    staleTime: 30000, // 30 seconds
  })
}

export function usePaymentsQuery(params?: {
  limit?: number
  offset?: number
  status?: string
}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentApiClient.listPayments(params),
    staleTime: 60000, // 1 minute
  })
}

export function usePaymentStatusQuery(
  paymentId: string | undefined,
  options?: { refetchInterval?: number }
) {
  return useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => paymentApiClient.getPaymentStatus(paymentId!),
    enabled: !!paymentId,
    refetchInterval: options?.refetchInterval ?? 5000, // 5 seconds by default
  })
}

