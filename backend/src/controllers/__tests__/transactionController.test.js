import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import * as transactionController from '../transactionController.js'
import * as transactionService from '../../services/transactionService.js'

vi.mock('../../services/transactionService.js')

describe('Transaction Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  describe('logTransaction', () => {
    it('should log transaction successfully', async () => {
      const mockTx = {
        id: 1,
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
      }

      req.body = {
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      }

      transactionService.createTransaction = vi.fn().mockResolvedValue(mockTx)

      await transactionController.logTransaction(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          transaction: mockTx,
        })
      )
    })

    it('should handle errors', async () => {
      req.body = {
        txHash: '0x123',
        from: '0xabc',
        to: '0xdef',
        amount: '0.01',
      }

      const error = new Error('Database error')
      transactionService.createTransaction = vi.fn().mockRejectedValue(error)

      await transactionController.logTransaction(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTxs = [{ id: 1 }, { id: 2 }]

      req.query = { page: '1', limit: '10' }

      transactionService.getTransactions = vi.fn().mockResolvedValue({
        transactions: mockTxs,
        total: 50,
      })

      await transactionController.getTransactions(req, res, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTxs,
          pagination: expect.objectContaining({
            total: 50,
          }),
        })
      )
    })

    it('should handle default pagination', async () => {
      req.query = {}

      transactionService.getTransactions = vi.fn().mockResolvedValue({
        transactions: [],
        total: 0,
      })

      await transactionController.getTransactions(req, res, next)

      expect(transactionService.getTransactions).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
      })
    })
  })

  describe('getTransactionByHash', () => {
    it('should return transaction by hash', async () => {
      const mockTx = {
        id: 1,
        txHash: '0x123',
      }

      req.params = { txHash: '0x123' }

      transactionService.getTransactionByHash = vi.fn().mockResolvedValue(mockTx)

      await transactionController.getTransactionByHash(req, res, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          transaction: mockTx,
        })
      )
    })

    it('should return 404 if not found', async () => {
      req.params = { txHash: '0x123' }

      transactionService.getTransactionByHash = vi.fn().mockResolvedValue(null)

      await transactionController.getTransactionByHash(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})

