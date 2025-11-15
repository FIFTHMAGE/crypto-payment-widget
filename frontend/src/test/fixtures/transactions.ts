export const mockTransaction = {
  txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  to: '0x456def789abc123def456abc789def123abc456d',
  amount: '1.5',
  value: '1500000000000000000',
  timestamp: '2024-01-15T10:30:00Z',
  status: 'confirmed' as const,
  blockNumber: 12345678,
  gasUsed: '21000',
}

export const mockPendingTransaction = {
  ...mockTransaction,
  status: 'pending' as const,
  blockNumber: null,
}

export const mockFailedTransaction = {
  ...mockTransaction,
  status: 'failed' as const,
  error: 'Transaction reverted',
}

export const mockTransactions = [
  mockTransaction,
  mockPendingTransaction,
  {
    ...mockTransaction,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    amount: '2.0',
  },
]

