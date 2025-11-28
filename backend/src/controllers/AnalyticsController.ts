import { type NextFunction, type Request, type Response } from 'express';

import {
  getTransactionAnalytics,
  getVolumeByToken,
  getUserAnalytics,
  getTimeSeriesData,
  getPlatformMetrics,
} from '../services/analyticsService';
import { logger } from '../utils/logger';
import { successResponse } from '../utils/responseFormatter';

interface TransactionAnalyticsQuery {
  timeRange?: string;
}

interface TimeSeriesQuery {
  interval?: string;
  points?: string;
}

/**
 * @route GET /api/v1/analytics/transactions
 * @desc Get transaction analytics
 */
export const getTransactionAnalyticsController = async (
  req: Request<object, object, object, TransactionAnalyticsQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { timeRange = '24h' } = req.query;

    const analytics = await getTransactionAnalytics(timeRange);

    res.json(
      successResponse({
        analytics,
      })
    );
  } catch (error) {
    logger.error('Error in getTransactionAnalyticsController:', error);
    next(error);
  }
};

/**
 * @route GET /api/v1/analytics/volume
 * @desc Get volume analytics by token
 */
export const getVolumeAnalyticsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const volumeData = await getVolumeByToken();

    res.json(
      successResponse({
        volumeByToken: volumeData,
      })
    );
  } catch (error) {
    logger.error('Error in getVolumeAnalyticsController:', error);
    next(error);
  }
};

/**
 * @route GET /api/v1/analytics/users
 * @desc Get user analytics
 */
export const getUserAnalyticsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userAnalytics = await getUserAnalytics();

    res.json(
      successResponse({
        users: userAnalytics,
      })
    );
  } catch (error) {
    logger.error('Error in getUserAnalyticsController:', error);
    next(error);
  }
};

/**
 * @route GET /api/v1/analytics/timeseries
 * @desc Get time series data
 */
export const getTimeSeriesController = async (
  req: Request<object, object, object, TimeSeriesQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { interval = 'hour', points = '24' } = req.query;
    const parsedPoints = parseInt(points, 10);

    const timeSeriesData = await getTimeSeriesData(interval, parsedPoints);

    res.json(
      successResponse({
        timeSeries: timeSeriesData,
        interval,
        points: parsedPoints,
      })
    );
  } catch (error) {
    logger.error('Error in getTimeSeriesController:', error);
    next(error);
  }
};

/**
 * @route GET /api/v1/analytics/platform
 * @desc Get platform metrics
 */
export const getPlatformMetricsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const metrics = await getPlatformMetrics();

    res.json(
      successResponse({
        metrics,
      })
    );
  } catch (error) {
    logger.error('Error in getPlatformMetricsController:', error);
    next(error);
  }
};

export const analyticsController = {
  getTransactionAnalyticsController,
  getVolumeAnalyticsController,
  getUserAnalyticsController,
  getTimeSeriesController,
  getPlatformMetricsController,
};

export default analyticsController;
