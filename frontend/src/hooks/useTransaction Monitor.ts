/**
 * useTransactionMonitor - Real-time transaction monitoring hook
 * @module hooks/useTransactionMonitor
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REPLACED = 'replaced',
  CANCELLED = 'cancelled'
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
  gasLimit: string;
  gasPrice: string;
  chainId: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
  status: TransactionStatus;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: string;
  status: boolean;
  logs: any[];
}

export interface UseTransactionMonitorOptions {
  pollingInterval?: number;
  confirmationsRequired?: number;
  timeout?: number;
  onConfirmed?: (tx: Transaction) => void;
  onFailed?: (error: Error) => void;
}

export interface UseTransactionMonitorReturn {
  transactions: Map<string, Transaction>;
  isMonitoring: boolean;
  addTransaction: (hash: string) => void;
  removeTransaction: (hash: string) => void;
  getTransaction: (hash: string) => Transaction | undefined;
  clearAll: () => void;
}

const DEFAULT_POLLING_INTERVAL = 5000;
const DEFAULT_CONFIRMATIONS = 12;
const DEFAULT_TIMEOUT = 600000; // 10 minutes

export function useTransactionMonitor(
  options: UseTransactionMonitorOptions = {}
): UseTransactionMonitorReturn {
  const {
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    confirmationsRequired = DEFAULT_CONFIRMATIONS,
    timeout = DEFAULT_TIMEOUT,
    onConfirmed,
    onFailed
  } = options;

  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const pollingRef = useRef<NodeJS.Timeout>();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Fetch transaction details
   */
  const fetchTransaction = useCallback(async (hash: string): Promise<Transaction | null> => {
    try {
      // This would call your blockchain service
      // const tx = await provider.getTransaction(hash);
      // const receipt = await provider.getTransactionReceipt(hash);
      
      // Mock implementation
      const mockTx: Transaction = {
        hash,
        from: '0x' + '1'.repeat(40),
        to: '0x' + '2'.repeat(40),
        value: '1000000000000000000',
        nonce: 0,
        gasLimit: '21000',
        gasPrice: '20000000000',
        chainId: 1,
        confirmations: Math.floor(Math.random() * 20),
        status: TransactionStatus.PENDING
      };

      return mockTx;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }, []);

  /**
   * Update transaction status
   */
  const updateTransaction = useCallback((hash: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = new Map(prev);
      const existing = updated.get(hash);
      
      if (existing) {
        updated.set(hash, { ...existing, ...updates });
      }
      
      return updated;
    });
  }, []);

  /**
   * Monitor single transaction
   */
  const monitorTransaction = useCallback(async (hash: string) => {
    try {
      const tx = await fetchTransaction(hash);
      if (!tx) return;

      // Update transaction
      updateTransaction(hash, tx);

      // Check if confirmed
      if (tx.confirmations >= confirmationsRequired) {
        const finalTx = { ...tx, status: TransactionStatus.CONFIRMED };
        updateTransaction(hash, finalTx);
        
        // Clear timeout
        const timeoutId = timeoutRefs.current.get(hash);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutRefs.current.delete(hash);
        }

        // Trigger callback
        if (onConfirmed) {
          onConfirmed(finalTx);
        }

        // Remove from monitoring
        removeTransaction(hash);
      }
    } catch (error) {
      console.error(`Error monitoring transaction ${hash}:`, error);
      
      if (onFailed) {
        onFailed(error as Error);
      }
    }
  }, [fetchTransaction, updateTransaction, confirmationsRequired, onConfirmed, onFailed]);

  /**
   * Poll all transactions
   */
  const pollTransactions = useCallback(async () => {
    const hashes = Array.from(transactions.keys());
    
    for (const hash of hashes) {
      await monitorTransaction(hash);
    }
  }, [transactions, monitorTransaction]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    pollingRef.current = setInterval(() => {
      pollTransactions();
    }, pollingInterval);
  }, [isMonitoring, pollTransactions, pollingInterval]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = undefined;
    }
    setIsMonitoring(false);
  }, []);

  /**
   * Add transaction to monitor
   */
  const addTransaction = useCallback((hash: string) => {
    setTransactions(prev => {
      const updated = new Map(prev);
      
      if (!updated.has(hash)) {
        updated.set(hash, {
          hash,
          from: '',
          to: '',
          value: '0',
          nonce: 0,
          gasLimit: '0',
          gasPrice: '0',
          chainId: 0,
          confirmations: 0,
          status: TransactionStatus.PENDING
        });

        // Set timeout for this transaction
        const timeoutId = setTimeout(() => {
          updateTransaction(hash, {
            status: TransactionStatus.FAILED
          });
          
          if (onFailed) {
            onFailed(new Error('Transaction timeout'));
          }
          
          removeTransaction(hash);
        }, timeout);
        
        timeoutRefs.current.set(hash, timeoutId);
      }
      
      return updated;
    });

    // Start monitoring if not already
    if (!isMonitoring) {
      startMonitoring();
    }
  }, [isMonitoring, startMonitoring, timeout, updateTransaction, onFailed]);

  /**
   * Remove transaction from monitoring
   */
  const removeTransaction = useCallback((hash: string) => {
    setTransactions(prev => {
      const updated = new Map(prev);
      updated.delete(hash);
      return updated;
    });

    // Clear timeout
    const timeoutId = timeoutRefs.current.get(hash);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(hash);
    }

    // Stop monitoring if no more transactions
    if (transactions.size <= 1) {
      stopMonitoring();
    }
  }, [transactions.size, stopMonitoring]);

  /**
   * Get transaction by hash
   */
  const getTransaction = useCallback((hash: string): Transaction | undefined => {
    return transactions.get(hash);
  }, [transactions]);

  /**
   * Clear all transactions
   */
  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutRefs.current.clear();

    setTransactions(new Map());
    stopMonitoring();
  }, [stopMonitoring]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, [stopMonitoring]);

  /**
   * Auto-start/stop monitoring based on transactions
   */
  useEffect(() => {
    if (transactions.size > 0 && !isMonitoring) {
      startMonitoring();
    } else if (transactions.size === 0 && isMonitoring) {
      stopMonitoring();
    }
  }, [transactions.size, isMonitoring, startMonitoring, stopMonitoring]);

  return {
    transactions,
    isMonitoring,
    addTransaction,
    removeTransaction,
    getTransaction,
    clearAll
  };
}

