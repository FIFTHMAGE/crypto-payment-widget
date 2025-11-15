import { useQuery } from '@tanstack/react-query'
import { transactionApiClient } from '../api'
import type { TransactionListParams, TransactionSearchParams } from '../types'

export function useTransaction(txHash: string | undefined) {
  return useQuery({
    queryKey: ['transaction', txHash],
    queryFn: () => transactionApiClient.getTransaction(txHash!),
    enabled: !!txHash,
    staleTime: 30000, // 30 seconds
    refetchInterval: (data) => {
      // Stop refetching if transaction is confirmed or failed
      if (!data) return false
      if (data.status === 'confirmed' || data.status === 'failed') {
        return false
      }
      return 5000 // 5 seconds for pending transactions
    },
  })
}

export function useTransactionList(params?: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionApiClient.listTransactions(params),
    staleTime: 60000, // 1 minute
  })
}

export function useTransactionSearch(params: TransactionSearchParams) {
  return useQuery({
    queryKey: ['transaction-search', params],
    queryFn: () => transactionApiClient.searchTransactions(params),
    enabled: !!params.query || !!params.address,
    staleTime: 30000,
  })
}

export function useTransactionReceipt(txHash: string | undefined) {
  return useQuery({
    queryKey: ['transaction-receipt', txHash],
    queryFn: () => transactionApiClient.getReceipt(txHash!),
    enabled: !!txHash,
    staleTime: 300000, // 5 minutes - receipts don't change
  })
}

