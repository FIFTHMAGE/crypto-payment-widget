/**
 * PaymentController - HTTP request handlers for payments
 * @module controllers
 */

import { Request, Response } from 'express';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { EnhancedPayment, PaymentStatus, BlockchainNetwork } from '../models/Enhanced Payment.model';
import { Logger } from '../utils/logger';

export class PaymentController {
  private logger: Logger;
  private paymentRepository: PaymentRepository;

  constructor(paymentRepository: PaymentRepository) {
    this.logger = new Logger('PaymentController');
    this.paymentRepository = paymentRepository;
  }

  /**
   * Create a new payment
   */
  createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        merchantId,
        payerAddress,
        payeeAddress,
        amount,
        currency,
        network,
        metadata,
      } = req.body;

      const payment: EnhancedPayment = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId,
        payerAddress,
        payeeAddress,
        amount,
        currency,
        network: network as BlockchainNetwork,
        status: PaymentStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transactions: [],
        metadata,
      };

      const created = await this.paymentRepository.create(payment);
      this.logger.info(`Payment created: ${created.id}`);

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error: any) {
      this.logger.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment',
        message: error.message,
      });
    }
  };

  /**
   * Get payment by ID
   */
  getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      this.logger.error('Error getting payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment',
        message: error.message,
      });
    }
  };

  /**
   * List payments with filters
   */
  listPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        merchantId,
        status,
        network,
        payerAddress,
        payeeAddress,
        fromDate,
        toDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        merchantId: merchantId as string,
        status: status as PaymentStatus,
        network: network as BlockchainNetwork,
        payerAddress: payerAddress as string,
        payeeAddress: payeeAddress as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as keyof EnhancedPayment,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await this.paymentRepository.findMany(filters, pagination);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      this.logger.error('Error listing payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list payments',
        message: error.message,
      });
    }
  };

  /**
   * Update payment
   */
  updatePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await this.paymentRepository.update(id, updates);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      this.logger.error('Error updating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update payment',
        message: error.message,
      });
    }
  };

  /**
   * Delete payment
   */
  deletePayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.paymentRepository.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error: any) {
      this.logger.error('Error deleting payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete payment',
        message: error.message,
      });
    }
  };

  /**
   * Get payment statistics
   */
  getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { merchantId } = req.query;
      const stats = await this.paymentRepository.getStatistics(merchantId as string);
      const statusCounts = await this.paymentRepository.countByStatus(merchantId as string);

      res.status(200).json({
        success: true,
        data: {
          ...stats,
          statusCounts,
        },
      });
    } catch (error: any) {
      this.logger.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        message: error.message,
      });
    }
  };

  /**
   * Update payment status
   */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(PaymentStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid payment status',
        });
        return;
      }

      const updated = await this.paymentRepository.updateStatus(id, status);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      this.logger.error('Error updating status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update status',
        message: error.message,
      });
    }
  };
}
