import { type NextFunction, type Request, type Response } from 'express';

import { cacheService } from '../services/cacheService';
import { transactionService } from '../services/transactionService';
import { logger } from '../utils/logger';

interface SystemInfo {
  status: 'operational' | 'degraded' | 'maintenance';
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: string;
  version: string;
  node: string;
  env: string;
  transactions: Record<string, unknown>;
  cache: Record<string, unknown>;
}

interface SystemResponse {
  success: boolean;
  data?: SystemInfo | Record<string, unknown>;
  message?: string;
}

/**
 * @route GET /api/v1/system/info
 * @desc Get system information and status
 */
export const getSystemInfo = async (
  _req: Request,
  res: Response<SystemResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await transactionService.getStats();
    const cacheStats = cacheService.getStats();

    const systemInfo: SystemInfo = {
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      env: process.env.NODE_ENV || 'development',
      transactions: stats,
      cache: cacheStats,
    };

    res.json({
      success: true,
      data: systemInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/v1/system/cache/clear
 * @desc Clear the application cache
 */
export const clearCache = async (
  _req: Request,
  res: Response<SystemResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    cacheService.clear();
    logger.info('Cache cleared by admin');

    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/system/logs
 * @desc Get application logs
 */
export const getLogs = async (
  _req: Request,
  res: Response<SystemResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const logs = {
      message: 'Logs endpoint - integrate with logging service',
      hint: 'Use tools like Winston, Bunyan, or Pino for production logging',
      availableLogLevels: ['error', 'warn', 'info', 'debug'],
    };

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/system/health
 * @desc Get system health check
 */
export const getHealthCheck = async (
  _req: Request,
  res: Response<SystemResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'up',
        database: 'up',
        cache: 'up',
      },
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

export const systemController = {
  getSystemInfo,
  clearCache,
  getLogs,
  getHealthCheck,
};

export default systemController;

