import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  createTransaction,
  getTransactions,
  getTransactionByHash,
  updateTransactionStatus,
  getTransactionStats,
} from '../transactionService.js'

describe('Transaction Service', () => {
  beforeEach(() => {
    // Reset in-memory storage
    global.transactions = []
  })

  describe('createTransaction', () => {
    it('should create new transaction', async () => {
      const txData = {
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      }

      const result = await createTransaction(txData)

      expect(result).toMatchObject({
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
        status: 'pending',
      })
      expect(result.id).toBeDefined()
      expect(result.timestamp).toBeDefined()
    })

    it('should reject duplicate transaction hash', async () => {
      const txData = {
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      }

      await createTransaction(txData)

      await expect(createTransaction(txData)).rejects.toThrow('already exists')
    })
  })

  describe('getTransactions', () => {
    it('should return paginated results', async () => {
      // Create multiple transactions
      for (let i = 0; i < 25; i++) {
        await createTransaction({
          txHash: `0x${i}`,
          from: '0xabc',
          to: '0xdef',
          amount: '0.01',
        })
      }

      const result = await getTransactions({ page: 1, limit: 10 })

      expect(result.transactions).toHaveLength(10)
      expect(result.total).toBe(25)
    })

    it('should filter by status', async () => {
      await createTransaction({
        txHash: '0x1',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      })

      await createTransaction({
        txHash: '0x2',
        from: '0xabc',
        to: '0xdef',
        amount: '0.02',
      })

      await updateTransactionStatus('0x2', 'confirmed')

      const result = await getTransactions({ status: 'confirmed' })

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].txHash).toBe('0x2')
    })
  })

  describe('getTransactionByHash', () => {
    it('should find transaction by hash', async () => {
      await createTransaction({
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      })

      const result = await getTransactionByHash('0x123')

      expect(result).toBeDefined()
      expect(result.txHash).toBe('0x123')
    })

    it('should return null if not found', async () => {
      const result = await getTransactionByHash('0xnonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateTransactionStatus', () => {
    it('should update transaction status', async () => {
      await createTransaction({
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      })

      const result = await updateTransactionStatus('0x123', 'confirmed')

      expect(result.status).toBe('confirmed')
      expect(result.updatedAt).toBeDefined()
    })
  })

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      await createTransaction({
        txHash: '0x1',
        from: '0xabc',
        to: '0xdef',
        amount: '1.0',
      })

      await createTransaction({
        txHash: '0x2',
        from: '0xabc',
        to: '0xdef',
        amount: '2.0',
      })

      await updateTransactionStatus('0x2', 'confirmed')

      const stats = await getTransactionStats()

      expect(stats.total).toBe(2)
      expect(stats.pending).toBe(1)
      expect(stats.confirmed).toBe(1)
      expect(stats.totalVolume).toBe('3.0')
    })
  })
})

