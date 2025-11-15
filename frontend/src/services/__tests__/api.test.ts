import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logTransaction, getTransactions, getTransactionByHash, verifyTransaction } from '../api'

// Mock fetch
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logTransaction', () => {
    it('should log transaction successfully', async () => {
      const mockResponse = {
        success: true,
        transaction: { id: 1, txHash: '0x123' },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await logTransaction({
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      })

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should handle API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(
        logTransaction({
          txHash: '0x123',
          from: '0xabc',
          to: '0xdef',
          amount: '0.01',
        })
      ).rejects.toThrow()
    })
  })

  describe('getTransactions', () => {
    it('should fetch transactions with pagination', async () => {
      const mockResponse = {
        success: true,
        transactions: [{ id: 1 }, { id: 2 }],
        total: 2,
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getTransactions({ page: 1, limit: 10 })

      expect(result.transactions).toHaveLength(2)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      )
    })
  })

  describe('getTransactionByHash', () => {
    it('should fetch specific transaction', async () => {
      const mockResponse = {
        success: true,
        transaction: { id: 1, txHash: '0x123' },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await getTransactionByHash('0x123')

      expect(result.transaction.txHash).toBe('0x123')
    })
  })

  describe('verifyTransaction', () => {
    it('should verify transaction on blockchain', async () => {
      const mockResponse = {
        success: true,
        verified: true,
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await verifyTransaction('0x123')

      expect(result.verified).toBe(true)
    })
  })
})
