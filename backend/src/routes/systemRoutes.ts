import { Router } from 'express';

import {
  getSystemInfo,
  clearCache,
  getLogs,
  getHealthCheck,
} from '../controllers/systemController';
import { apiKeyAuth, requirePermission } from '../middleware/apiKeyAuth';

const router = Router();

/**
 * @route   GET /api/v1/system/info
 * @desc    Get system information and metrics
 * @access  Private (API Key required)
 */
router.get('/info', apiKeyAuth, getSystemInfo);

/**
 * @route   GET /api/v1/system/health
 * @desc    Get system health status
 * @access  Private (API Key required)
 */
router.get('/health', apiKeyAuth, getHealthCheck);

/**
 * @route   POST /api/v1/system/cache/clear
 * @desc    Clear the application cache
 * @access  Private (Admin only)
 */
router.post(
  '/cache/clear',
  apiKeyAuth,
  requirePermission('admin'),
  clearCache
);

/**
 * @route   GET /api/v1/system/logs
 * @desc    Get application logs
 * @access  Private (Admin only)
 */
router.get(
  '/logs',
  apiKeyAuth,
  requirePermission('admin'),
  getLogs
);

/**
 * @route   GET /api/v1/system/config
 * @desc    Get non-sensitive configuration
 * @access  Private (API Key required)
 */
router.get('/config', apiKeyAuth, (_req, res) => {
  res.json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      features: {
        webhooks: true,
        analytics: true,
        caching: true,
      },
    },
  });
});

export default router;

