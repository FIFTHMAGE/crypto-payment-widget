import { type Request, type Response, Router } from 'express';

const router = Router();

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version?: string;
  checks?: {
    database?: 'up' | 'down';
    cache?: 'up' | 'down';
    blockchain?: 'up' | 'down';
  };
}

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (_req: Request, res: Response<HealthResponse>): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'alive' });
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', async (_req: Request, res: Response<HealthResponse>): Promise<void> => {
  try {
    // In production, add actual health checks for dependencies
    const checks = {
      database: 'up' as const,
      cache: 'up' as const,
      blockchain: 'up' as const,
    };

    const allHealthy = Object.values(checks).every((status) => status === 'up');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks,
    });
  } catch {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
});

export default router;

