/**
 * Analytics Controller
 * Handles analytics-related HTTP requests
 */

import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get analytics data
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, merchantId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const analytics = await this.analyticsService.getAnalytics(
        new Date(startDate as string),
        new Date(endDate as string),
        merchantId as string | undefined,
      );

      res.json(successResponse(analytics));
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      res.status(500).json(errorResponse('Failed to fetch analytics'));
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.query;

      const metrics = await this.analyticsService.getDashboardMetrics(
        merchantId as string | undefined,
      );

      res.json(successResponse(metrics));
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      res.status(500).json(errorResponse('Failed to fetch dashboard metrics'));
    }
  }

  /**
   * Get merchant revenue
   */
  async getMerchantRevenue(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.params;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const revenue = await this.analyticsService.getMerchantRevenue(
        merchantId,
        new Date(startDate as string),
        new Date(endDate as string),
        groupBy as 'day' | 'week' | 'month',
      );

      res.json(successResponse(revenue));
    } catch (error) {
      logger.error('Error fetching merchant revenue:', error);
      res.status(500).json(errorResponse('Failed to fetch merchant revenue'));
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, format = 'json', merchantId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const report = await this.analyticsService.generateReport(
        new Date(startDate as string),
        new Date(endDate as string),
        format as 'json' | 'csv',
        merchantId as string | undefined,
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
        res.send(report);
      } else {
        res.json(successResponse(report));
      }
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(500).json(errorResponse('Failed to generate report'));
    }
  }

  /**
   * Get payment trends
   */
  async getPaymentTrends(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30d', merchantId } = req.query;

      const trends = await this.analyticsService.getPaymentTrends(
        period as string,
        merchantId as string | undefined,
      );

      res.json(successResponse(trends));
    } catch (error) {
      logger.error('Error fetching payment trends:', error);
      res.status(500).json(errorResponse('Failed to fetch payment trends'));
    }
  }

  /**
   * Get top merchants
   */
  async getTopMerchants(req: Request, res: Response): Promise<void> {
    try {
      const { limit = '10', sortBy = 'volume' } = req.query;

      const merchants = await this.analyticsService.getTopMerchants(
        parseInt(limit as string),
        sortBy as 'volume' | 'transactions',
      );

      res.json(successResponse(merchants));
    } catch (error) {
      logger.error('Error fetching top merchants:', error);
      res.status(500).json(errorResponse('Failed to fetch top merchants'));
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, merchantId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Start date and end date are required'));
        return;
      }

      const stats = await this.analyticsService.getTransactionStats(
        new Date(startDate as string),
        new Date(endDate as string),
        merchantId as string | undefined,
      );

      res.json(successResponse(stats));
    } catch (error) {
      logger.error('Error fetching transaction stats:', error);
      res.status(500).json(errorResponse('Failed to fetch transaction stats'));
    }
  }
}
