/**
 * Payment Service Unit Tests
 * Comprehensive tests for payment processing logic
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PaymentService } from '../../src/services/PaymentService';
import { PaymentStatus } from '../../src/types/payment';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockDb: any;
  let mockBlockchainService: any;

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn(),
    };

    // Mock blockchain service
    mockBlockchainService = {
      sendTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
    };

    paymentService = new PaymentService(mockDb, mockBlockchainService);
  });

  describe('createPayment', () => {
    it('should create a new payment successfully', async () => {
      const paymentData = {
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'payment-456',
            ...paymentData,
            status: PaymentStatus.PENDING,
            created_at: new Date(),
          },
        ],
      });

      const result = await paymentService.createPayment(paymentData);

      expect(result).toBeDefined();
      expect(result.id).toBe('payment-456');
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should reject payment with invalid amount', async () => {
      const paymentData = {
        merchantId: 'merchant-123',
        amount: '-100.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
      };

      await expect(paymentService.createPayment(paymentData)).rejects.toThrow(
        'Invalid payment amount',
      );
    });

    it('should reject payment with invalid address', async () => {
      const paymentData = {
        merchantId: 'merchant-123',
        amount: '100.00',
        currency: 'USD',
        recipient: 'invalid-address',
      };

      await expect(paymentService.createPayment(paymentData)).rejects.toThrow(
        'Invalid recipient address',
      );
    });
  });

  describe('processPayment', () => {
    it('should process pending payment successfully', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.PENDING,
            amount: '100.00',
            recipient: '0x1234567890123456789012345678901234567890',
          },
        ],
      });

      mockBlockchainService.sendTransaction.mockResolvedValueOnce({
        hash: '0xabcdef',
      });

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.PROCESSING,
            transaction_hash: '0xabcdef',
          },
        ],
      });

      const result = await paymentService.processPayment(paymentId);

      expect(result.status).toBe(PaymentStatus.PROCESSING);
      expect(result.transactionHash).toBe('0xabcdef');
      expect(mockBlockchainService.sendTransaction).toHaveBeenCalledTimes(1);
    });

    it('should not process already completed payment', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.SUCCEEDED,
          },
        ],
      });

      await expect(paymentService.processPayment(paymentId)).rejects.toThrow(
        'Payment already processed',
      );
    });

    it('should handle blockchain transaction failure', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.PENDING,
            amount: '100.00',
            recipient: '0x1234567890123456789012345678901234567890',
          },
        ],
      });

      mockBlockchainService.sendTransaction.mockRejectedValueOnce(
        new Error('Insufficient gas'),
      );

      await expect(paymentService.processPayment(paymentId)).rejects.toThrow();
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.SUCCEEDED,
          },
        ],
      });

      const result = await paymentService.getPaymentStatus(paymentId);

      expect(result).toBe(PaymentStatus.SUCCEEDED);
    });

    it('should throw error for non-existent payment', async () => {
      const paymentId = 'non-existent';

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      await expect(paymentService.getPaymentStatus(paymentId)).rejects.toThrow(
        'Payment not found',
      );
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const paymentId = 'payment-456';
      const newStatus = PaymentStatus.SUCCEEDED;

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: newStatus,
            updated_at: new Date(),
          },
        ],
      });

      const result = await paymentService.updatePaymentStatus(paymentId, newStatus);

      expect(result.status).toBe(newStatus);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should validate status transitions', async () => {
      const paymentId = 'payment-456';

      // Cannot go from SUCCEEDED to PENDING
      await expect(
        paymentService.updatePaymentStatus(paymentId, PaymentStatus.PENDING, {
          currentStatus: PaymentStatus.SUCCEEDED,
        }),
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('cancelPayment', () => {
    it('should cancel pending payment', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.CANCELLED,
          },
        ],
      });

      const result = await paymentService.cancelPayment(paymentId);

      expect(result.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should not cancel completed payment', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.SUCCEEDED,
          },
        ],
      });

      await expect(paymentService.cancelPayment(paymentId)).rejects.toThrow(
        'Cannot cancel completed payment',
      );
    });
  });

  describe('listPayments', () => {
    it('should list payments with pagination', async () => {
      const merchantId = 'merchant-123';
      const limit = 10;
      const offset = 0;

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'payment-1',
            status: PaymentStatus.SUCCEEDED,
          },
          {
            id: 'payment-2',
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const result = await paymentService.listPayments({ merchantId, limit, offset });

      expect(result).toHaveLength(2);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should filter payments by status', async () => {
      const merchantId = 'merchant-123';
      const status = PaymentStatus.SUCCEEDED;

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'payment-1',
            status: PaymentStatus.SUCCEEDED,
          },
        ],
      });

      const result = await paymentService.listPayments({ merchantId, status });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(PaymentStatus.SUCCEEDED);
    });
  });

  describe('getPaymentStatistics', () => {
    it('should calculate payment statistics', async () => {
      const merchantId = 'merchant-123';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            total_payments: 100,
            successful_payments: 95,
            failed_payments: 5,
            total_volume: '10000.00',
          },
        ],
      });

      const result = await paymentService.getPaymentStatistics(merchantId);

      expect(result.totalPayments).toBe(100);
      expect(result.successRate).toBe(95);
      expect(result.totalVolume).toBe('10000.00');
    });
  });

  describe('refundPayment', () => {
    it('should refund completed payment', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.SUCCEEDED,
            amount: '100.00',
            transaction_hash: '0xabcdef',
          },
        ],
      });

      mockBlockchainService.sendTransaction.mockResolvedValueOnce({
        hash: '0xrefund123',
      });

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.REFUNDED,
            refund_hash: '0xrefund123',
          },
        ],
      });

      const result = await paymentService.refundPayment(paymentId);

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(result.refundHash).toBe('0xrefund123');
    });

    it('should not refund already refunded payment', async () => {
      const paymentId = 'payment-456';

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: paymentId,
            status: PaymentStatus.REFUNDED,
          },
        ],
      });

      await expect(paymentService.refundPayment(paymentId)).rejects.toThrow(
        'Payment already refunded',
      );
    });
  });
});

