export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const API_ENDPOINTS = {
  HEALTH: '/health',
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_BY_HASH: (hash: string) => `/api/transactions/${hash}`,
  VERIFY_TRANSACTION: (hash: string) => `/api/transactions/${hash}/verify`,
} as const

export const API_TIMEOUT = 30000 // 30 seconds

export const DEFAULT_PAGINATION = {
  limit: 50,
  offset: 0,
} as const

