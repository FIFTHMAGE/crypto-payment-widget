import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePaymentStore } from '../../store'

describe('Performance Metrics', () => {
  it('should handle large transaction lists efficiently', () => {
    const { result } = renderHook(() => usePaymentStore())
    
    const startTime = performance.now()
    
    // Add 1000 transactions
    for (let i = 0; i < 1000; i++) {
      result.current.addTransaction({
        hash: `0x${i.toString(16).padStart(64, '0')}`,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
        to: '0x456def789abc123def456abc789def123abc456d',
        amount: '0.01',
        status: 'pending',
        timestamp: Date.now(),
      })
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete in less than 1 second
    expect(duration).toBeLessThan(1000)
    expect(result.current.transactions).toHaveLength(1000)
  })

  it('should memo-ize computed values', () => {
    const { result, rerender } = renderHook(() => usePaymentStore())
    
    result.current.addTransaction({
      hash: '0x123',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      to: '0x456def789abc123def456abc789def123abc456d',
      amount: '0.01',
      status: 'pending',
      timestamp: Date.now(),
    })
    
    const firstRender = result.current.transactions
    rerender()
    const secondRender = result.current.transactions
    
    // Same reference if data hasn't changed
    expect(firstRender).toBe(secondRender)
  })

  it('should handle rapid state updates', async () => {
    const { result } = renderHook(() => usePaymentStore())
    
    const updates = Array.from({ length: 100 }, (_, i) => ({
      hash: `0x${i}`,
      status: 'confirmed' as const,
    }))
    
    const startTime = performance.now()
    
    updates.forEach(update => {
      result.current.updateTransactionStatus(update.hash, update.status)
    })
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(100)
  })
})

