import { cacheService } from '../services/cacheService.js'
import { transactionService } from '../services/transactionService.js'
import { logger } from '../utils/logger.js'

export const getSystemInfo = async (req, res, next) => {
  try {
    const stats = await transactionService.getStats()
    const cacheStats = cacheService.getStats()

    const systemInfo = {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      env: process.env.NODE_ENV || 'development',
      transactions: stats,
      cache: cacheStats,
    }

    res.json({
      success: true,
      data: systemInfo,
    })
  } catch (error) {
    next(error)
  }
}

export const clearCache = async (req, res, next) => {
  try {
    cacheService.clear()
    logger.info('Cache cleared by admin')

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getLogs = async (req, res, next) => {
  try {
    // In production, fetch from logging service
    const logs = {
      message: 'Logs endpoint - integrate with logging service',
      hint: 'Use tools like Winston, Bunyan, or Pino for production logging',
    }

    res.json({
      success: true,
      data: logs,
    })
  } catch (error) {
    next(error)
  }
}

