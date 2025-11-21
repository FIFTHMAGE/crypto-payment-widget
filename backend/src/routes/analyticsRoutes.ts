/**
 * Analytics Routes
 * Defines analytics-related API endpoints
 */

import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { Pool } from 'pg';

export function createAnalyticsRoutes(db: Pool): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);
  const analyticsController = new AnalyticsController(analyticsService);
  const authMiddleware = new AuthMiddleware();

  /**
   * @route GET /api/analytics
   * @desc Get payment analytics for a date range
   * @access Private
   */
  router.get(
    '/',
    authMiddleware.authenticate.bind(authMiddleware),
    analyticsController.getAnalytics.bind(analyticsController),
  );

  /**
   * @route GET /api/analytics/dashboard
   * @desc Get real-time dashboard metrics
   * @access Private
   */
  router.get(
    '/dashboard',
    authMiddleware.authenticate.bind(authMiddleware),
    analyticsController.getDashboardMetrics.bind(analyticsController),
  );

  /**
   * @route GET /api/analytics/merchant/:merchantId/revenue
   * @desc Get merchant revenue data
   * @access Private
   */
  router.get(
    '/merchant/:merchantId/revenue',
    authMiddleware.authenticate.bind(authMiddleware),
    analyticsController.getMerchantRevenue.bind(analyticsController),
  );

  /**
   * @route GET /api/analytics/report
   * @desc Generate and download analytics report
   * @access Private
   */
  router.get(
    '/report',
    authMiddleware.authenticate.bind(authMiddleware),
    analyticsController.generateReport.bind(analyticsController),
  );

  return router;
}

