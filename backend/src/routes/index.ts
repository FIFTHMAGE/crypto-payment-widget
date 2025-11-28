import { Router } from 'express';

import analyticsRoutes from './analyticsRoutes';
import healthRoutes from './healthRoutes';
import systemRoutes from './systemRoutes';
import transactionRoutes from './transactionRoutes';
import webhookRoutes from './webhookRoutes';

const router = Router();

/**
 * Health check routes (public)
 */
router.use('/health', healthRoutes);

/**
 * API v1 routes
 */

// Transaction management
router.use('/v1/transactions', transactionRoutes);

// Analytics and reporting
router.use('/v1/analytics', analyticsRoutes);

// Webhook management
router.use('/v1/webhooks', webhookRoutes);

// System administration
router.use('/v1/system', systemRoutes);

// API documentation endpoint
router.get('/v1', (_req, res) => {
  res.json({
    name: 'Crypto Payment Widget API',
    version: 'v1',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      transactions: '/api/v1/transactions',
      analytics: '/api/v1/analytics',
      webhooks: '/api/v1/webhooks',
      system: '/api/v1/system',
    },
  });
});

export default router;
