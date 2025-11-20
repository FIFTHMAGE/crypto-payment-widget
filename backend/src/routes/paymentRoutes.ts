/**
 * paymentRoutes - Express routes for payment endpoints
 * @module routes
 */

import { Router } from 'express';
import { paymentController } from '../controllers/PaymentController';
import { validateCreatePayment, validateRequired } from '../middleware/ValidationMiddleware';

const router = Router();

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Private
 */
router.post('/', validateCreatePayment, (req, res) => {
  paymentController.createPayment(req, res);
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', (req, res) => {
  paymentController.getPayment(req, res);
});

/**
 * @route   GET /api/payments/tx/:txHash
 * @desc    Get payment by transaction hash
 * @access  Private
 */
router.get('/tx/:txHash', (req, res) => {
  paymentController.getPaymentByTxHash(req, res);
});

/**
 * @route   GET /api/payments
 * @desc    List payments with filtering and pagination
 * @access  Private
 */
router.get('/', (req, res) => {
  paymentController.listPayments(req, res);
});

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment
 * @access  Private
 */
router.put('/:id', (req, res) => {
  paymentController.updatePayment(req, res);
});

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete payment
 * @access  Private
 */
router.delete('/:id', (req, res) => {
  paymentController.deletePayment(req, res);
});

/**
 * @route   GET /api/payments/stats/summary
 * @desc    Get payment statistics
 * @access  Private
 */
router.get('/stats/summary', (req, res) => {
  paymentController.getStatistics(req, res);
});

/**
 * @route   GET /api/payments/stats/recent
 * @desc    Get recent payments
 * @access  Private
 */
router.get('/stats/recent', (req, res) => {
  paymentController.getRecentPayments(req, res);
});

/**
 * @route   GET /api/payments/stats/volume
 * @desc    Get payment volume by period
 * @access  Private
 */
router.get('/stats/volume', (req, res) => {
  paymentController.getVolumeByPeriod(req, res);
});

/**
 * @route   GET /api/payments/search
 * @desc    Search payments
 * @access  Private
 */
router.get('/search', (req, res) => {
  paymentController.searchPayments(req, res);
});

/**
 * @route   POST /api/payments/bulk/update-status
 * @desc    Bulk update payment status
 * @access  Private
 */
router.post('/bulk/update-status', validateRequired('ids', 'status'), (req, res) => {
  paymentController.bulkUpdateStatus(req, res);
});

/**
 * @route   GET /api/payments/expired/pending
 * @desc    Get expired pending payments
 * @access  Private
 */
router.get('/expired/pending', (req, res) => {
  paymentController.getExpiredPending(req, res);
});

export default router;

