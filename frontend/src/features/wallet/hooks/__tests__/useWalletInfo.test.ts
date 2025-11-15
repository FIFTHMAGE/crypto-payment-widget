import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWalletInfo } from '../useWalletInfo'
import { mockWagmi } from '../../../../test/mocks/wagmi'

vi.mock('wagmi', () => mockWagmi)

describe('useWalletInfo', () => {
  it('should return wallet information when connected', () => {
    const { result } = renderHook(() => useWalletInfo())
    
    expect(result.current.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')
    expect(result.current.isConnected).toBe(true)
    expect(result.current.formattedAddress).toMatch(/0x742d...0bEb9/)
  })

  it('should return null when not connected', () => {
    mockWagmi.useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    })

    const { result } = renderHook(() => useWalletInfo())
    
    expect(result.current.address).toBeUndefined()
    expect(result.current.isConnected).toBe(false)
  })
})

