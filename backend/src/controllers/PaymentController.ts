/**
 * PaymentController - HTTP request handlers for payment endpoints
 * @module controllers
 */

import { Request, Response } from 'express';
import { paymentRepository, CreatePaymentData } from '../database/PaymentRepository';

export class PaymentController {
  /**
   * Create a new payment
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData: CreatePaymentData = {
        merchantId: req.body.merchantId,
        payerAddress: req.body.payerAddress,
        payeeAddress: req.body.payeeAddress,
        amount: req.body.amount,
        currency: req.body.currency,
        tokenAddress: req.body.tokenAddress,
        network: req.body.network,
        metadata: req.body.metadata,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      };

      const payment = await paymentRepository.create(paymentData);

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentRepository.findById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get payment by transaction hash
   */
  async getPaymentByTxHash(req: Request, res: Response): Promise<void> {
    try {
      const { txHash } = req.params;
      const payment = await paymentRepository.findByTransactionHash(txHash);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * List payments with filtering and pagination
   */
  async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const filter = {
        merchantId: req.query.merchantId as string,
        payerAddress: req.query.payerAddress as string,
        payeeAddress: req.query.payeeAddress as string,
        status: req.query.status as any,
        network: req.query.network as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await paymentRepository.find(filter, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update payment
   */
  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = {
        status: req.body.status,
        transactionHash: req.body.transactionHash,
        metadata: req.body.metadata,
        feeAmount: req.body.feeAmount,
        netAmount: req.body.netAmount,
      };

      const payment = await paymentRepository.update(id, updateData);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await paymentRepository.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get payment statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filter = {
        merchantId: req.query.merchantId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const stats = await paymentRepository.getStatistics(filter);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recent payments
   */
  async getRecentPayments(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const merchantId = req.query.merchantId as string;

      const payments = await paymentRepository.getRecent(limit, merchantId);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get payment volume by period
   */
  async getVolumeByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
      const filter = {
        merchantId: req.query.merchantId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const volumeData = await paymentRepository.getVolumeByPeriod(period, filter);

      res.json({
        success: true,
        data: volumeData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch volume data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Search payments
   */
  async searchPayments(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await paymentRepository.search(query, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Bulk update payment status
   */
  async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid payment IDs',
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      const updated = await paymentRepository.bulkUpdateStatus(ids, status);

      res.json({
        success: true,
        data: {
          updated,
          total: ids.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to bulk update payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get expired pending payments
   */
  async getExpiredPending(req: Request, res: Response): Promise<void> {
    try {
      const payments = await paymentRepository.getExpiredPending();

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expired payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const paymentController = new PaymentController();

