import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionApiClient } from '../api'
import { useUIStore } from '../../../store'

export function useCancelTransaction() {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  return useMutation({
    mutationFn: (txHash: string) =>
      transactionApiClient.cancelTransaction(txHash),
    onSuccess: (_, txHash) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', txHash] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      addToast('Transaction cancellation initiated', 'success')
    },
    onError: (error: Error) => {
      addToast(`Failed to cancel: ${error.message}`, 'error')
    },
  })
}

export function useSpeedUpTransaction() {
  const queryClient = useQueryClient()
  const { addToast } = useUIStore()

  return useMutation({
    mutationFn: ({
      txHash,
      newGasPrice,
    }: {
      txHash: string
      newGasPrice: string
    }) => transactionApiClient.speedUpTransaction(txHash, newGasPrice),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      addToast(
        `Transaction sped up. New hash: ${data.newTxHash.slice(0, 10)}...`,
        'success'
      )
    },
    onError: (error: Error) => {
      addToast(`Failed to speed up: ${error.message}`, 'error')
    },
  })
}

