import { describe, it, expect, beforeEach } from 'vitest'
import { usePaymentStore } from '../paymentStore'

describe('Payment Store', () => {
  beforeEach(() => {
    usePaymentStore.getState().clearTransactions()
  })

  it('should add transaction', () => {
    const transaction = {
      txHash: '0x123',
      from: '0x456',
      to: '0x789',
      amount: '1.0',
      status: 'pending' as const,
    }

    usePaymentStore.getState().addTransaction(transaction)
    
    const state = usePaymentStore.getState()
    expect(state.transactions).toHaveLength(1)
    expect(state.transactions[0]).toEqual(transaction)
  })

  it('should update transaction', () => {
    const transaction = {
      txHash: '0x123',
      from: '0x456',
      to: '0x789',
      amount: '1.0',
      status: 'pending' as const,
    }

    usePaymentStore.getState().addTransaction(transaction)
    usePaymentStore.getState().updateTransaction('0x123', { status: 'confirmed' })
    
    const state = usePaymentStore.getState()
    expect(state.transactions[0].status).toBe('confirmed')
  })

  it('should set current transaction', () => {
    usePaymentStore.getState().setCurrentTransaction('0x123')
    expect(usePaymentStore.getState().currentTransaction).toBe('0x123')
  })

  it('should clear transactions', () => {
    usePaymentStore.getState().addTransaction({
      txHash: '0x123',
      from: '0x456',
      to: '0x789',
      amount: '1.0',
      status: 'pending',
    })

    usePaymentStore.getState().clearTransactions()
    expect(usePaymentStore.getState().transactions).toHaveLength(0)
  })
})

