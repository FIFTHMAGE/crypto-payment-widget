import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentApiClient } from '../api'
import type { ProcessPaymentParams, PaymentResponse } from '../types'
import { useUIStore } from '../../../store'

export function usePaymentMutation() {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  return useMutation({
    mutationFn: (params: ProcessPaymentParams) =>
      paymentApiClient.createPayment(params),
    onSuccess: (data: PaymentResponse) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      addToast('Payment initiated successfully', 'success')
    },
    onError: (error: Error) => {
      addToast(`Payment failed: ${error.message}`, 'error')
    },
  })
}

export function useRefundMutation() {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  return useMutation({
    mutationFn: ({
      paymentId,
      reason,
    }: {
      paymentId: string
      reason?: string
    }) => paymentApiClient.refundPayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      addToast('Refund processed successfully', 'success')
    },
    onError: (error: Error) => {
      addToast(`Refund failed: ${error.message}`, 'error')
    },
  })
}

