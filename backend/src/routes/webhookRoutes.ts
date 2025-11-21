/**
 * Webhook Routes
 * API endpoints for webhook management
 */

import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';
import { EnhancedWebhookService } from '../services/EnhancedWebhookService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { webhookSchemas } from '../schemas/webhook.schema';
import { Pool } from 'pg';

export function createWebhookRoutes(db: Pool): Router {
  const router = Router();
  const webhookService = new EnhancedWebhookService(db);
  const webhookController = new WebhookController(webhookService);
  const authMiddleware = new AuthMiddleware();
  const validationMiddleware = new ValidationMiddleware();

  /**
   * @route POST /api/webhooks
   * @desc Register a new webhook
   * @access Private
   */
  router.post(
    '/',
    authMiddleware.authenticate.bind(authMiddleware),
    validationMiddleware.validate(webhookSchemas.createWebhook, 'body'),
    webhookController.createWebhook.bind(webhookController),
  );

  /**
   * @route GET /api/webhooks
   * @desc Get all webhooks for merchant
   * @access Private
   */
  router.get(
    '/',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.getWebhooks.bind(webhookController),
  );

  /**
   * @route GET /api/webhooks/:id
   * @desc Get webhook by ID
   * @access Private
   */
  router.get(
    '/:id',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.getWebhook.bind(webhookController),
  );

  /**
   * @route PUT /api/webhooks/:id
   * @desc Update webhook
   * @access Private
   */
  router.put(
    '/:id',
    authMiddleware.authenticate.bind(authMiddleware),
    validationMiddleware.validate(webhookSchemas.updateWebhook, 'body'),
    webhookController.updateWebhook.bind(webhookController),
  );

  /**
   * @route DELETE /api/webhooks/:id
   * @desc Delete webhook
   * @access Private
   */
  router.delete(
    '/:id',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.deleteWebhook.bind(webhookController),
  );

  /**
   * @route POST /api/webhooks/:id/test
   * @desc Test webhook endpoint
   * @access Private
   */
  router.post(
    '/:id/test',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.testWebhook.bind(webhookController),
  );

  /**
   * @route GET /api/webhooks/:id/deliveries
   * @desc Get webhook delivery history
   * @access Private
   */
  router.get(
    '/:id/deliveries',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.getDeliveries.bind(webhookController),
  );

  /**
   * @route POST /api/webhooks/:id/retry/:deliveryId
   * @desc Retry failed webhook delivery
   * @access Private
   */
  router.post(
    '/:id/retry/:deliveryId',
    authMiddleware.authenticate.bind(authMiddleware),
    webhookController.retryDelivery.bind(webhookController),
  );

  return router;
}

