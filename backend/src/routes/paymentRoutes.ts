/**
 * Payment Routes - API routes for payment operations
 * @module routes
 */

import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { PaymentRepository } from '../repositories/PaymentRepository';

export function createPaymentRoutes(): Router {
  const router = Router();
  const paymentRepository = new PaymentRepository();
  const paymentController = new PaymentController(paymentRepository);

  /**
   * @route   POST /api/payments
   * @desc    Create a new payment
   * @access  Private
   */
  router.post('/', paymentController.createPayment);

  /**
   * @route   GET /api/payments/:id
   * @desc    Get payment by ID
   * @access  Private
   */
  router.get('/:id', paymentController.getPayment);

  /**
   * @route   GET /api/payments
   * @desc    List payments with filters
   * @access  Private
   */
  router.get('/', paymentController.listPayments);

  /**
   * @route   PUT /api/payments/:id
   * @desc    Update payment
   * @access  Private
   */
  router.put('/:id', paymentController.updatePayment);

  /**
   * @route   DELETE /api/payments/:id
   * @desc    Delete payment
   * @access  Private
   */
  router.delete('/:id', paymentController.deletePayment);

  /**
   * @route   GET /api/payments/stats/summary
   * @desc    Get payment statistics
   * @access  Private
   */
  router.get('/stats/summary', paymentController.getStatistics);

  /**
   * @route   PATCH /api/payments/:id/status
   * @desc    Update payment status
   * @access  Private
   */
  router.patch('/:id/status', paymentController.updateStatus);

  return router;
}
