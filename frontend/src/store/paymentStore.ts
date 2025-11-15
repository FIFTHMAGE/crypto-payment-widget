import { create } from 'zustand'
import type { Payment, LoadingState } from '../lib/types'

interface PaymentStore {
  payments: Payment[]
  currentPayment: Payment | null
  loadingState: LoadingState
  error: string | null

  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  setCurrentPayment: (payment: Payment | null) => void
  setLoadingState: (state: LoadingState) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  payments: [],
  currentPayment: null,
  loadingState: 'idle' as LoadingState,
  error: null,
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,

  setPayments: (payments) => set({ payments }),

  addPayment: (payment) =>
    set((state) => ({
      payments: [payment, ...state.payments],
    })),

  setCurrentPayment: (payment) => set({ currentPayment: payment }),

  setLoadingState: (loadingState) => set({ loadingState }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

