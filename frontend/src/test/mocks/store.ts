import { vi } from 'vitest'

export const mockPaymentStore = {
  currentTransaction: null,
  transactions: [],
  setCurrentTransaction: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  clearTransactions: vi.fn(),
}

export const mockUIStore = {
  toasts: [],
  addToast: vi.fn(),
  removeToast: vi.fn(),
  clearToasts: vi.fn(),
}

