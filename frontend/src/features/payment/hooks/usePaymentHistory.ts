import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services'
import type { Payment, PaginationParams } from '../../../lib/types'

export function usePaymentHistory(initialParams?: PaginationParams) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchPayments = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiService.getTransactions(params || initialParams)
        setPayments(result.items)
        setHasMore(result.hasMore)
        setTotal(result.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payments')
      } finally {
        setLoading(false)
      }
    },
    [initialParams]
  )

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const refresh = () => fetchPayments(initialParams)

  return {
    payments,
    loading,
    error,
    hasMore,
    total,
    refresh,
    fetchPayments,
  }
}

