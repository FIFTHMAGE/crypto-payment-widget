import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePayment } from '../usePayment'
import { mockWagmi } from '../../../../test/mocks/wagmi'

vi.mock('wagmi', () => mockWagmi)

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePayment())
    
    expect(result.current.isPending).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle payment execution', async () => {
    mockWagmi.useSendTransaction.mockReturnValue({
      sendTransaction: vi.fn(() => Promise.resolve({ hash: '0x123' })),
      isPending: false,
    })

    const { result } = renderHook(() => usePayment())
    
    await result.current.executePayment({
      to: '0x456',
      amount: '1.0',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle payment errors', async () => {
    const error = new Error('Transaction failed')
    mockWagmi.useSendTransaction.mockReturnValue({
      sendTransaction: vi.fn(() => Promise.reject(error)),
      isPending: false,
    })

    const { result } = renderHook(() => usePayment())
    
    try {
      await result.current.executePayment({
        to: '0x456',
        amount: '1.0',
      })
    } catch (e) {
      expect(result.current.error).toBeTruthy()
    }
  })
})

