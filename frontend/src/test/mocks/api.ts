import { vi } from 'vitest'

export const mockApiResponse = {
  transactions: {
    success: true,
    data: [
      {
        id: 1,
        txHash: '0x123abc',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
        to: '0x456def',
        amount: '1.5',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  createTransaction: {
    success: true,
    transaction: {
      id: 1,
      txHash: '0x123abc',
      status: 'pending',
    },
  },
}

export const mockApi = {
  get: vi.fn((url) => {
    if (url.includes('/transactions')) {
      return Promise.resolve(mockApiResponse.transactions)
    }
    return Promise.reject(new Error('Not found'))
  }),
  post: vi.fn(() => Promise.resolve(mockApiResponse.createTransaction)),
  put: vi.fn(() => Promise.resolve({ success: true })),
  delete: vi.fn(() => Promise.resolve({ success: true })),
}

