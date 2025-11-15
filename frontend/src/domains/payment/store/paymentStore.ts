import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  Payment,
  PaymentTemplate,
  PaymentFilters,
  RecurringPayment,
} from '../types'

interface PaymentState {
  // Active payment data
  activePayment: Payment | null
  recentPayments: Payment[]
  templates: PaymentTemplate[]
  recurringPayments: RecurringPayment[]

  // Filters and pagination
  filters: PaymentFilters
  currentPage: number
  pageSize: number

  // UI state
  isProcessing: boolean
  selectedPaymentId: string | null

  // Actions
  setActivePayment: (payment: Payment | null) => void
  addRecentPayment: (payment: Payment) => void
  clearRecentPayments: () => void

  // Templates
  addTemplate: (template: PaymentTemplate) => void
  updateTemplate: (id: string, updates: Partial<PaymentTemplate>) => void
  deleteTemplate: (id: string) => void
  incrementTemplateUsage: (id: string) => void

  // Recurring payments
  addRecurringPayment: (recurring: RecurringPayment) => void
  updateRecurringPayment: (
    id: string,
    updates: Partial<RecurringPayment>
  ) => void
  deleteRecurringPayment: (id: string) => void

  // Filters
  setFilters: (filters: Partial<PaymentFilters>) => void
  clearFilters: () => void

  // Pagination
  setPage: (page: number) => void
  setPageSize: (size: number) => void

  // Processing state
  setProcessing: (isProcessing: boolean) => void
  setSelectedPaymentId: (id: string | null) => void

  // Reset
  reset: () => void
}

const initialState = {
  activePayment: null,
  recentPayments: [],
  templates: [],
  recurringPayments: [],
  filters: {},
  currentPage: 0,
  pageSize: 10,
  isProcessing: false,
  selectedPaymentId: null,
}

export const usePaymentStore = create<PaymentState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setActivePayment: (payment) => set({ activePayment: payment }),

        addRecentPayment: (payment) =>
          set((state) => ({
            recentPayments: [payment, ...state.recentPayments].slice(0, 20),
          })),

        clearRecentPayments: () => set({ recentPayments: [] }),

        addTemplate: (template) =>
          set((state) => ({
            templates: [...state.templates, template],
          })),

        updateTemplate: (id, updates) =>
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
            ),
          })),

        deleteTemplate: (id) =>
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
          })),

        incrementTemplateUsage: (id) =>
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
            ),
          })),

        addRecurringPayment: (recurring) =>
          set((state) => ({
            recurringPayments: [...state.recurringPayments, recurring],
          })),

        updateRecurringPayment: (id, updates) =>
          set((state) => ({
            recurringPayments: state.recurringPayments.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          })),

        deleteRecurringPayment: (id) =>
          set((state) => ({
            recurringPayments: state.recurringPayments.filter(
              (r) => r.id !== id
            ),
          })),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            currentPage: 0, // Reset to first page
          })),

        clearFilters: () => set({ filters: {}, currentPage: 0 }),

        setPage: (page) => set({ currentPage: page }),

        setPageSize: (size) => set({ pageSize: size, currentPage: 0 }),

        setProcessing: (isProcessing) => set({ isProcessing }),

        setSelectedPaymentId: (id) => set({ selectedPaymentId: id }),

        reset: () => set(initialState),
      }),
      {
        name: 'payment-storage',
        partialize: (state) => ({
          templates: state.templates,
          recurringPayments: state.recurringPayments,
          recentPayments: state.recentPayments.slice(0, 10),
        }),
      }
    )
  )
)

