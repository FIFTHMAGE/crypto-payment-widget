import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Transaction, PendingTransaction, TransactionFilters } from '../types'

interface TransactionFilters {
  status?: string[]
  type?: string[]
  startDate?: Date
  endDate?: Date
}

interface TransactionState {
  // Transaction data
  recentTransactions: Transaction[]
  pendingTransactions: PendingTransaction[]
  watchedTransactions: string[] // Transaction hashes to monitor

  // Filters and pagination
  filters: TransactionFilters
  currentPage: number
  pageSize: number

  // UI state
  selectedTxHash: string | null
  showPendingOnly: boolean

  // Actions
  addRecentTransaction: (transaction: Transaction) => void
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void
  removeTransaction: (hash: string) => void
  clearRecentTransactions: () => void

  // Pending transactions
  addPendingTransaction: (transaction: PendingTransaction) => void
  removePendingTransaction: (hash: string) => void
  clearPendingTransactions: () => void

  // Watched transactions
  addWatchedTransaction: (hash: string) => void
  removeWatchedTransaction: (hash: string) => void
  clearWatchedTransactions: () => void

  // Filters
  setFilters: (filters: Partial<TransactionFilters>) => void
  clearFilters: () => void

  // Pagination
  setPage: (page: number) => void
  setPageSize: (size: number) => void

  // UI state
  setSelectedTxHash: (hash: string | null) => void
  setShowPendingOnly: (show: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  recentTransactions: [],
  pendingTransactions: [],
  watchedTransactions: [],
  filters: {},
  currentPage: 0,
  pageSize: 20,
  selectedTxHash: null,
  showPendingOnly: false,
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        addRecentTransaction: (transaction) =>
          set((state) => ({
            recentTransactions: [
              transaction,
              ...state.recentTransactions.filter(
                (t) => t.hash !== transaction.hash
              ),
            ].slice(0, 50), // Keep last 50 transactions
          })),

        updateTransaction: (hash, updates) =>
          set((state) => ({
            recentTransactions: state.recentTransactions.map((t) =>
              t.hash === hash ? { ...t, ...updates } : t
            ),
          })),

        removeTransaction: (hash) =>
          set((state) => ({
            recentTransactions: state.recentTransactions.filter(
              (t) => t.hash !== hash
            ),
          })),

        clearRecentTransactions: () => set({ recentTransactions: [] }),

        addPendingTransaction: (transaction) =>
          set((state) => ({
            pendingTransactions: [
              transaction,
              ...state.pendingTransactions.filter(
                (t) => t.hash !== transaction.hash
              ),
            ],
          })),

        removePendingTransaction: (hash) =>
          set((state) => ({
            pendingTransactions: state.pendingTransactions.filter(
              (t) => t.hash !== hash
            ),
          })),

        clearPendingTransactions: () => set({ pendingTransactions: [] }),

        addWatchedTransaction: (hash) =>
          set((state) => ({
            watchedTransactions: Array.from(
              new Set([...state.watchedTransactions, hash])
            ),
          })),

        removeWatchedTransaction: (hash) =>
          set((state) => ({
            watchedTransactions: state.watchedTransactions.filter(
              (h) => h !== hash
            ),
          })),

        clearWatchedTransactions: () => set({ watchedTransactions: [] }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            currentPage: 0,
          })),

        clearFilters: () => set({ filters: {}, currentPage: 0 }),

        setPage: (page) => set({ currentPage: page }),

        setPageSize: (size) => set({ pageSize: size, currentPage: 0 }),

        setSelectedTxHash: (hash) => set({ selectedTxHash: hash }),

        setShowPendingOnly: (show) => set({ showPendingOnly: show }),

        reset: () => set(initialState),
      }),
      {
        name: 'transaction-storage',
        partialize: (state) => ({
          recentTransactions: state.recentTransactions.slice(0, 20),
          watchedTransactions: state.watchedTransactions,
        }),
      }
    )
  )
)

