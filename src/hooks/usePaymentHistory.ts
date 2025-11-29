/**
 * usePaymentHistory Hook
 * Fetch and manage payment history records
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface PaymentHistoryItem {
  id: string;
  transactionHash: string;
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockNumber?: number;
  fee?: string;
  memo?: string;
}

export interface UsePaymentHistoryOptions {
  address: string | undefined;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UsePaymentHistoryReturn {
  payments: PaymentHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filter: (criteria: PaymentFilterCriteria) => void;
  getPayment: (id: string) => PaymentHistoryItem | null;
}

export interface PaymentFilterCriteria {
  type?: 'sent' | 'received' | 'all';
  status?: 'pending' | 'confirmed' | 'failed' | 'all';
  currency?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: string;
  maxAmount?: string;
}

export function usePaymentHistory(options: UsePaymentHistoryOptions): UsePaymentHistoryReturn {
  const { address, pageSize = 20, autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filterCriteria, setFilterCriteria] = useState<PaymentFilterCriteria>({});

  const fetchPayments = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // In production, call actual API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock data
      const mockPayments: PaymentHistoryItem[] = Array.from({ length: pageSize }, (_, i) => ({
        id: `pay_${pageNum}_${i}`,
        transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        type: Math.random() > 0.5 ? 'sent' : 'received',
        amount: (Math.random() * 10).toFixed(6),
        currency: ['ETH', 'USDC', 'DAI'][Math.floor(Math.random() * 3)],
        from: Math.random() > 0.5 ? address : `0x${Math.random().toString(16).slice(2, 42)}`,
        to: Math.random() > 0.5 ? `0x${Math.random().toString(16).slice(2, 42)}` : address,
        status: ['pending', 'confirmed', 'confirmed', 'confirmed', 'failed'][Math.floor(Math.random() * 5)] as 'pending' | 'confirmed' | 'failed',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        fee: (Math.random() * 0.01).toFixed(6),
      }));

      // Apply filters
      const filtered = mockPayments.filter(payment => {
        if (filterCriteria.type && filterCriteria.type !== 'all' && payment.type !== filterCriteria.type) {
          return false;
        }
        if (filterCriteria.status && filterCriteria.status !== 'all' && payment.status !== filterCriteria.status) {
          return false;
        }
        if (filterCriteria.currency && payment.currency !== filterCriteria.currency) {
          return false;
        }
        return true;
      });

      if (append) {
        setPayments(prev => [...prev, ...filtered]);
      } else {
        setPayments(filtered);
      }

      setTotalCount(100); // Mock total
      setHasMore(pageNum < 4); // Mock pagination
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payment history'));
    } finally {
      setIsLoading(false);
    }
  }, [address, pageSize, filterCriteria]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPayments(nextPage, true);
  }, [isLoading, hasMore, page, fetchPayments]);

  const refresh = useCallback(async () => {
    setPage(0);
    setPayments([]);
    await fetchPayments(0, false);
  }, [fetchPayments]);

  const filter = useCallback((criteria: PaymentFilterCriteria) => {
    setFilterCriteria(criteria);
    setPage(0);
    setPayments([]);
  }, []);

  const getPayment = useCallback((id: string): PaymentHistoryItem | null => {
    return payments.find(p => p.id === id) || null;
  }, [payments]);

  // Initial fetch
  useEffect(() => {
    if (address) {
      fetchPayments(0, false);
    }
  }, [address, fetchPayments]);

  // Re-fetch when filters change
  useEffect(() => {
    if (address) {
      fetchPayments(0, false);
    }
  }, [filterCriteria, address, fetchPayments]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !address) return;

    const interval = setInterval(() => {
      fetchPayments(0, false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, address, refreshInterval, fetchPayments]);

  return {
    payments,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    filter,
    getPayment,
  };
}

export default usePaymentHistory;

