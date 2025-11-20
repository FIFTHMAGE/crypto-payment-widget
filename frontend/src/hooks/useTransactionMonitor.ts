/**
 * useTransactionMonitor - Hook for monitoring blockchain transactions
 * @module hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
  DROPPED = 'dropped',
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: TransactionStatus;
  blockNumber?: number;
  confirmations: number;
  timestamp?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
  error?: string;
}

export interface MonitorOptions {
  requiredConfirmations?: number;
  pollingInterval?: number;
  timeout?: number;
  onStatusChange?: (tx: Transaction) => void;
  onConfirmation?: (tx: Transaction, confirmations: number) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_OPTIONS: Required<MonitorOptions> = {
  requiredConfirmations: 3,
  pollingInterval: 3000,
  timeout: 300000, // 5 minutes
  onStatusChange: () => {},
  onConfirmation: () => {},
  onError: () => {},
};

export function useTransactionMonitor(options?: MonitorOptions) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Add transaction to monitor
   */
  const addTransaction = useCallback(
    (txHash: string, initialData?: Partial<Transaction>) => {
      const transaction: Transaction = {
        hash: txHash,
        from: initialData?.from || '',
        to: initialData?.to || '',
        value: initialData?.value || '0',
        status: TransactionStatus.PENDING,
        confirmations: 0,
        ...initialData,
      };

      setTransactions((prev) => new Map(prev).set(txHash, transaction));

      // Set timeout for this transaction
      const timeout = setTimeout(() => {
        setTransactions((prev) => {
          const updated = new Map(prev);
          const tx = updated.get(txHash);
          if (tx && tx.status === TransactionStatus.PENDING) {
            const timedOutTx = {
              ...tx,
              status: TransactionStatus.DROPPED,
              error: 'Transaction timed out',
            };
            updated.set(txHash, timedOutTx);
            opts.onStatusChange(timedOutTx);
          }
          return updated;
        });
      }, opts.timeout);

      timeoutsRef.current.set(txHash, timeout);

      return transaction;
    },
    [opts]
  );

  /**
   * Remove transaction from monitoring
   */
  const removeTransaction = useCallback((txHash: string) => {
    setTransactions((prev) => {
      const updated = new Map(prev);
      updated.delete(txHash);
      return updated;
    });

    // Clear timeout
    const timeout = timeoutsRef.current.get(txHash);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(txHash);
    }
  }, []);

  /**
   * Get transaction by hash
   */
  const getTransaction = useCallback(
    (txHash: string): Transaction | undefined => {
      return transactions.get(txHash);
    },
    [transactions]
  );

  /**
   * Get all pending transactions
   */
  const getPendingTransactions = useCallback((): Transaction[] => {
    return Array.from(transactions.values()).filter(
      (tx) => tx.status === TransactionStatus.PENDING
    );
  }, [transactions]);

  /**
   * Get all confirmed transactions
   */
  const getConfirmedTransactions = useCallback((): Transaction[] => {
    return Array.from(transactions.values()).filter(
      (tx) => tx.status === TransactionStatus.CONFIRMED
    );
  }, [transactions]);

  /**
   * Get all failed transactions
   */
  const getFailedTransactions = useCallback((): Transaction[] => {
    return Array.from(transactions.values()).filter(
      (tx) =>
        tx.status === TransactionStatus.FAILED ||
        tx.status === TransactionStatus.REVERTED ||
        tx.status === TransactionStatus.DROPPED
    );
  }, [transactions]);

  /**
   * Check transaction status
   */
  const checkTransactionStatus = useCallback(
    async (txHash: string): Promise<Transaction | null> => {
      try {
        // Mock implementation - would use actual blockchain provider
        const tx = transactions.get(txHash);
        if (!tx) return null;

        // Simulate blockchain query
        const receipt = await mockGetTransactionReceipt(txHash);

        if (!receipt) {
          return tx; // Still pending
        }

        // Get current block number
        const currentBlock = await mockGetBlockNumber();
        const confirmations = receipt.blockNumber
          ? currentBlock - receipt.blockNumber + 1
          : 0;

        // Determine status
        let status = TransactionStatus.PENDING;
        if (receipt.status === 'success') {
          status =
            confirmations >= opts.requiredConfirmations
              ? TransactionStatus.CONFIRMED
              : TransactionStatus.PENDING;
        } else if (receipt.status === 'failed') {
          status = TransactionStatus.FAILED;
        } else if (receipt.status === 'reverted') {
          status = TransactionStatus.REVERTED;
        }

        const updatedTx: Transaction = {
          ...tx,
          status,
          blockNumber: receipt.blockNumber,
          confirmations,
          timestamp: receipt.timestamp,
          gasUsed: receipt.gasUsed,
          effectiveGasPrice: receipt.effectiveGasPrice,
          error: receipt.error,
        };

        return updatedTx;
      } catch (error) {
        opts.onError(error as Error);
        return null;
      }
    },
    [transactions, opts]
  );

  /**
   * Update transaction
   */
  const updateTransaction = useCallback(
    (txHash: string, updates: Partial<Transaction>) => {
      setTransactions((prev) => {
        const updated = new Map(prev);
        const tx = updated.get(txHash);
        if (tx) {
          const updatedTx = { ...tx, ...updates };
          updated.set(txHash, updatedTx);

          // Notify if status changed
          if (updates.status && updates.status !== tx.status) {
            opts.onStatusChange(updatedTx);
          }

          // Notify on confirmation
          if (updates.confirmations && updates.confirmations !== tx.confirmations) {
            opts.onConfirmation(updatedTx, updates.confirmations);
          }

          // Clear timeout if confirmed or failed
          if (
            updatedTx.status === TransactionStatus.CONFIRMED ||
            updatedTx.status === TransactionStatus.FAILED ||
            updatedTx.status === TransactionStatus.REVERTED
          ) {
            const timeout = timeoutsRef.current.get(txHash);
            if (timeout) {
              clearTimeout(timeout);
              timeoutsRef.current.delete(txHash);
            }
          }
        }
        return updated;
      });
    },
    [opts]
  );

  /**
   * Poll all pending transactions
   */
  const pollTransactions = useCallback(async () => {
    const pending = getPendingTransactions();

    for (const tx of pending) {
      const updated = await checkTransactionStatus(tx.hash);
      if (updated && updated.status !== tx.status) {
        updateTransaction(tx.hash, updated);
      }
    }
  }, [getPendingTransactions, checkTransactionStatus, updateTransaction]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);

    // Start polling
    intervalRef.current = setInterval(() => {
      pollTransactions();
    }, opts.pollingInterval);
  }, [isMonitoring, pollTransactions, opts.pollingInterval]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    // Clear polling interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, [isMonitoring]);

  /**
   * Clear all transactions
   */
  const clearAll = useCallback(() => {
    stopMonitoring();
    setTransactions(new Map());
  }, [stopMonitoring]);

  // Auto-start monitoring when transactions are added
  useEffect(() => {
    if (transactions.size > 0 && !isMonitoring) {
      startMonitoring();
    } else if (transactions.size === 0 && isMonitoring) {
      stopMonitoring();
    }
  }, [transactions.size, isMonitoring, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // State
    transactions: Array.from(transactions.values()),
    isMonitoring,

    // Actions
    addTransaction,
    removeTransaction,
    updateTransaction,
    checkTransactionStatus,
    startMonitoring,
    stopMonitoring,
    clearAll,

    // Queries
    getTransaction,
    getPendingTransactions,
    getConfirmedTransactions,
    getFailedTransactions,
  };
}

// Mock functions for demonstration
async function mockGetTransactionReceipt(
  _txHash: string
): Promise<{
  blockNumber: number;
  status: 'success' | 'failed' | 'reverted';
  timestamp: number;
  gasUsed: string;
  effectiveGasPrice: string;
  error?: string;
} | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Random chance of success/failure
  const random = Math.random();
  if (random < 0.2) {
    return null; // Still pending
  }

  return {
    blockNumber: Math.floor(Math.random() * 1000000),
    status: random < 0.9 ? 'success' : 'failed',
    timestamp: Date.now(),
    gasUsed: '21000',
    effectiveGasPrice: '20000000000',
  };
}

async function mockGetBlockNumber(): Promise<number> {
  return Math.floor(Math.random() * 1000000) + 10;
}

