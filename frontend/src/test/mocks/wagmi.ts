import { vi } from 'vitest'

export const mockAccount = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9' as `0x${string}`,
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
  status: 'connected' as const,
}

export const mockUseAccount = vi.fn(() => mockAccount)

export const mockConnect = vi.fn()
export const mockDisconnect = vi.fn()
export const mockSwitchChain = vi.fn()
export const mockSendTransaction = vi.fn()
export const mockWaitForTransactionReceipt = vi.fn()

export const mockWagmi = {
  useAccount: mockUseAccount,
  useConnect: vi.fn(() => ({ connect: mockConnect })),
  useDisconnect: vi.fn(() => ({ disconnect: mockDisconnect })),
  useSwitchChain: vi.fn(() => ({ switchChain: mockSwitchChain })),
  useSendTransaction: vi.fn(() => ({
    sendTransaction: mockSendTransaction,
    isPending: false,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    data: { transactionHash: '0x123' },
    isLoading: false,
  })),
}

