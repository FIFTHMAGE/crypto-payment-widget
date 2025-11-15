import { describe, it, expect, beforeEach } from 'vitest'
import { usePaymentStore } from '../paymentStore'

describe('Payment Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePaymentStore.setState({
      transactions: [],
      pendingTx: null,
    })
  })

  it('should add transaction', () => {
    const store = usePaymentStore.getState()
    
    store.addTransaction({
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      amount: '0.01',
      status: 'pending',
      timestamp: Date.now(),
    })

    expect(usePaymentStore.getState().transactions).toHaveLength(1)
  })

  it('should update transaction status', () => {
    const store = usePaymentStore.getState()
    
    store.addTransaction({
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      amount: '0.01',
      status: 'pending',
      timestamp: Date.now(),
    })

    store.updateTransactionStatus('0x123', 'confirmed')

    const tx = usePaymentStore.getState().transactions[0]
    expect(tx.status).toBe('confirmed')
  })

  it('should clear all transactions', () => {
    const store = usePaymentStore.getState()
    
    store.addTransaction({
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      amount: '0.01',
      status: 'pending',
      timestamp: Date.now(),
    })

    store.clearTransactions()

    expect(usePaymentStore.getState().transactions).toHaveLength(0)
  })

  it('should set pending transaction', () => {
    const store = usePaymentStore.getState()
    
    store.setPendingTx('0x123')

    expect(usePaymentStore.getState().pendingTx).toBe('0x123')
  })

  it('should filter transactions by status', () => {
    const store = usePaymentStore.getState()
    
    store.addTransaction({
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      amount: '0.01',
      status: 'pending',
      timestamp: Date.now(),
    })

    store.addTransaction({
      hash: '0x456',
      from: '0xabc',
      to: '0xdef',
      amount: '0.02',
      status: 'confirmed',
      timestamp: Date.now(),
    })

    const pending = usePaymentStore.getState().transactions.filter(
      tx => tx.status === 'pending'
    )

    expect(pending).toHaveLength(1)
  })
})
