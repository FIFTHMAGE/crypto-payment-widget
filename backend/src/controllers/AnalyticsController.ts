/**
 * Analytics Controller
 * Handles analytics-related API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get payment analytics
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, merchantId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const analytics = await this.analyticsService.getPaymentAnalytics(
        new Date(startDate as string),
        new Date(endDate as string),
        merchantId as string | undefined,
      );

      res.json(successResponse(analytics, 'Analytics retrieved successfully'));
    } catch (error) {
      logger.error('Error getting analytics:', error);
      next(error);
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { merchantId } = req.query;

      const metrics = await this.analyticsService.getDashboardMetrics(
        merchantId as string | undefined,
      );

      res.json(successResponse(metrics, 'Dashboard metrics retrieved successfully'));
    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      next(error);
    }
  }

  /**
   * Get merchant revenue
   */
  async getMerchantRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { merchantId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const revenue = await this.analyticsService.getMerchantRevenue(
        merchantId,
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.json(successResponse(revenue, 'Revenue data retrieved successfully'));
    } catch (error) {
      logger.error('Error getting merchant revenue:', error);
      next(error);
    }
  }

  /**
   * Generate report
   */
  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, merchantId, format = 'json' } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const report = await this.analyticsService.generateReport(
        new Date(startDate as string),
        new Date(endDate as string),
        merchantId as string | undefined,
        format as 'json' | 'csv',
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
        res.send(report);
      } else {
        res.json(successResponse(report, 'Report generated successfully'));
      }
    } catch (error) {
      logger.error('Error generating report:', error);
      next(error);
    }
  }
}

