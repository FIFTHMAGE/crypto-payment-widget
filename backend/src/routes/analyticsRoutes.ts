import { Router } from 'express';

import {
  getTransactionAnalyticsController,
  getVolumeAnalyticsController,
  getUserAnalyticsController,
  getTimeSeriesController,
  getPlatformMetricsController,
} from '../controllers/analyticsController';
import { apiKeyAuth } from '../middleware/apiKeyAuth';

const router = Router();

/**
 * @route   GET /api/v1/analytics/transactions
 * @desc    Get transaction analytics
 * @access  Private (API Key required)
 */
router.get('/transactions', apiKeyAuth, getTransactionAnalyticsController);

/**
 * @route   GET /api/v1/analytics/volume
 * @desc    Get volume analytics by token
 * @access  Private (API Key required)
 */
router.get('/volume', apiKeyAuth, getVolumeAnalyticsController);

/**
 * @route   GET /api/v1/analytics/users
 * @desc    Get user analytics
 * @access  Private (API Key required)
 */
router.get('/users', apiKeyAuth, getUserAnalyticsController);

/**
 * @route   GET /api/v1/analytics/timeseries
 * @desc    Get time series data
 * @access  Private (API Key required)
 */
router.get('/timeseries', apiKeyAuth, getTimeSeriesController);

/**
 * @route   GET /api/v1/analytics/platform
 * @desc    Get platform metrics
 * @access  Private (API Key required)
 */
router.get('/platform', apiKeyAuth, getPlatformMetricsController);

export default router;
