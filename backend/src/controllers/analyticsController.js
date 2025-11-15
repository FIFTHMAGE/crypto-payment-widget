import {
  getTransactionAnalytics,
  getVolumeByToken,
  getUserAnalytics,
  getTimeSeriesData,
  getPlatformMetrics,
} from '../services/analyticsService.js'
import { successResponse, errorResponse } from '../utils/responseFormatter.js'
import logger from '../utils/logger.js'

/**
 * @route GET /api/v1/analytics/transactions
 * @desc Get transaction analytics
 */
export const getTransactionAnalyticsController = async (req, res, next) => {
  try {
    const { timeRange = '24h' } = req.query

    const analytics = getTransactionAnalytics(timeRange)

    res.json(
      successResponse({
        analytics,
      })
    )
  } catch (error) {
    logger.error('Error in getTransactionAnalyticsController:', error)
    next(error)
  }
}

/**
 * @route GET /api/v1/analytics/volume
 * @desc Get volume analytics by token
 */
export const getVolumeAnalyticsController = async (req, res, next) => {
  try {
    const volumeData = getVolumeByToken()

    res.json(
      successResponse({
        volumeByToken: volumeData,
      })
    )
  } catch (error) {
    logger.error('Error in getVolumeAnalyticsController:', error)
    next(error)
  }
}

/**
 * @route GET /api/v1/analytics/users
 * @desc Get user analytics
 */
export const getUserAnalyticsController = async (req, res, next) => {
  try {
    const userAnalytics = getUserAnalytics()

    res.json(
      successResponse({
        users: userAnalytics,
      })
    )
  } catch (error) {
    logger.error('Error in getUserAnalyticsController:', error)
    next(error)
  }
}

/**
 * @route GET /api/v1/analytics/timeseries
 * @desc Get time series data
 */
export const getTimeSeriesController = async (req, res, next) => {
  try {
    const { interval = 'hour', points = 24 } = req.query

    const timeSeriesData = getTimeSeriesData(interval, parseInt(points))

    res.json(
      successResponse({
        timeSeries: timeSeriesData,
        interval,
        points: parseInt(points),
      })
    )
  } catch (error) {
    logger.error('Error in getTimeSeriesController:', error)
    next(error)
  }
}

/**
 * @route GET /api/v1/analytics/platform
 * @desc Get platform metrics
 */
export const getPlatformMetricsController = async (req, res, next) => {
  try {
    const metrics = getPlatformMetrics()

    res.json(
      successResponse({
        metrics,
      })
    )
  } catch (error) {
    logger.error('Error in getPlatformMetricsController:', error)
    next(error)
  }
}

export default {
  getTransactionAnalyticsController,
  getVolumeAnalyticsController,
  getUserAnalyticsController,
  getTimeSeriesController,
  getPlatformMetricsController,
}
