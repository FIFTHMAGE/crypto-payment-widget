import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import * as transactionController from '../transactionController';
import { transactionService } from '../../services/transactionService';

vi.mock('../../services/transactionService', () => ({
  transactionService: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByHash: vi.fn(),
    update: vi.fn(),
    getStats: vi.fn(),
  },
}));

describe('Transaction Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockTx = {
        id: 1,
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRequest.body = {
        txHash: mockTx.txHash,
        from: mockTx.from,
        to: mockTx.to,
        amount: '1.0',
      };

      vi.mocked(transactionService.create).mockResolvedValue(mockTx);

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTx,
        })
      );
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        txHash: 'invalid',
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      };

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      };

      const error = new Error('Database error');
      vi.mocked(transactionService.create).mockRejectedValue(error);

      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTxs = [
        { id: 1, txHash: '0x123' },
        { id: 2, txHash: '0x456' },
      ];

      mockRequest.query = { limit: '10', offset: '0' };

      vi.mocked(transactionService.findAll).mockResolvedValue({
        items: mockTxs as any,
        total: 50,
        limit: 10,
        offset: 0,
        hasMore: true,
      });

      await transactionController.getTransactions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should handle default pagination', async () => {
      mockRequest.query = {};

      vi.mocked(transactionService.findAll).mockResolvedValue({
        items: [],
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      });

      await transactionController.getTransactions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(transactionService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
    });
  });

  describe('getTransactionByHash', () => {
    it('should return transaction by hash', async () => {
      const mockTx = {
        id: 1,
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRequest.params = { txHash: mockTx.txHash };

      vi.mocked(transactionService.findByHash).mockResolvedValue(mockTx);

      await transactionController.getTransactionByHash(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTx,
        })
      );
    });

    it('should handle transaction not found', async () => {
      mockRequest.params = { txHash: '0x' + '1'.repeat(64) };

      vi.mocked(transactionService.findByHash).mockResolvedValue(null);

      await transactionController.getTransactionByHash(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      const mockStats = {
        total: 100,
        pending: 10,
        confirmed: 85,
        failed: 5,
        cancelled: 0,
        totalVolume: 1000,
      };

      vi.mocked(transactionService.getStats).mockResolvedValue(mockStats);

      await transactionController.getTransactionStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockStats,
        })
      );
    });
  });
});

