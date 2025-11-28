import { Router } from 'express';

import {
  createTransaction,
  getTransactions,
  getTransactionByHash,
  verifyTransaction,
  getTransactionStats,
} from '../controllers/transactionController';
import { apiKeyAuth, optionalApiKeyAuth } from '../middleware/apiKeyAuth';
import { validateRequest, validateQueryParams } from '../middleware/validateRequest';

const router = Router();

// Allowed query parameters for transaction listing
const ALLOWED_QUERY_PARAMS = ['limit', 'offset', 'status', 'from', 'to', 'token', 'chainId'];

/**
 * @route   POST /api/v1/transactions
 * @desc    Create a new transaction record
 * @access  Private (API Key required)
 */
router.post('/', apiKeyAuth, createTransaction);

/**
 * @route   GET /api/v1/transactions
 * @desc    Get all transactions with pagination and filters
 * @access  Private (API Key required)
 * @query   limit - Number of results (default: 10)
 * @query   offset - Pagination offset (default: 0)
 * @query   status - Filter by status
 * @query   from - Filter by sender address
 * @query   to - Filter by recipient address
 */
router.get(
  '/',
  apiKeyAuth,
  validateQueryParams(ALLOWED_QUERY_PARAMS),
  getTransactions
);

/**
 * @route   GET /api/v1/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private (API Key required)
 */
router.get('/stats', apiKeyAuth, getTransactionStats);

/**
 * @route   GET /api/v1/transactions/:txHash
 * @desc    Get a specific transaction by hash
 * @access  Public (with optional API key for extended data)
 */
router.get('/:txHash', optionalApiKeyAuth, getTransactionByHash);

/**
 * @route   POST /api/v1/transactions/:txHash/verify
 * @desc    Verify a transaction on-chain
 * @access  Private (API Key required)
 */
router.post('/:txHash/verify', apiKeyAuth, verifyTransaction);

/**
 * @route   GET /api/v1/transactions/:txHash/status
 * @desc    Get transaction status
 * @access  Public
 */
router.get('/:txHash/status', optionalApiKeyAuth, (_req, res) => {
  // This would typically fetch real-time status from blockchain
  res.json({
    success: true,
    data: {
      status: 'pending',
      confirmations: 0,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

