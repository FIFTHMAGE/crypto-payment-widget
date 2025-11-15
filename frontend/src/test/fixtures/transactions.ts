export const mockTransaction = {
  hash: '0x742d35cc6634c0532925a3b844bc9e7595f0beb9742d35cc6634c0532925a3b8',
  from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  to: '0x456def789abc123def456abc789def123abc456d',
  amount: '0.01',
  value: '10000000000000000',
  status: 'pending' as const,
  timestamp: 1705315800000,
  blockNumber: 12345678,
  gasUsed: '21000',
  gasPrice: '20000000000',
}

export const mockConfirmedTransaction = {
  ...mockTransaction,
  hash: '0x123abc456def789abc123def456abc789def123abc456def789abc123def456abc',
  status: 'confirmed' as const,
  confirmations: 12,
}

export const mockFailedTransaction = {
  ...mockTransaction,
  hash: '0x987zyx654wvu321zyx654wvu321zyx654wvu321zyx654wvu321zyx654wvu3',
  status: 'failed' as const,
  error: 'Transaction reverted',
}

export const mockTransactions = [
  mockTransaction,
  mockConfirmedTransaction,
  mockFailedTransaction,
  {
    ...mockTransaction,
    hash: '0xaaa111bbb222ccc333ddd444eee555fff666aaa111bbb222ccc333ddd444eee5',
    amount: '0.5',
    value: '500000000000000000',
    timestamp: 1705315900000,
  },
  {
    ...mockTransaction,
    hash: '0xbbb222ccc333ddd444eee555fff666aaa111bbb222ccc333ddd444eee555fff6',
    amount: '1.0',
    value: '1000000000000000000',
    status: 'confirmed' as const,
    timestamp: 1705316000000,
  },
]

export const mockEscrowPayment = {
  escrowId: '0x11122233344455566677788899900aabbccddeeff11122233344455566677788',
  payer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  payee: '0x456def789abc123def456abc789def123abc456d',
  amount: '1.0',
  releaseTime: Date.now() + 86400000, // 24 hours from now
  status: 'escrowed' as const,
  metadata: 'Test escrow payment',
}

export const mockPaymentReceipt = {
  transactionHash: mockTransaction.hash,
  status: 'success' as const,
  blockNumber: 12345678,
  blockHash: '0xblock123abc456def789',
  from: mockTransaction.from,
  to: mockTransaction.to,
  gasUsed: 21000n,
  effectiveGasPrice: 20000000000n,
  logs: [],
  logsBloom: '0x',
}
