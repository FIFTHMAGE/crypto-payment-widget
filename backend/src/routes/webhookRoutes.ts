/**
 * Webhook Routes
 * API routes for webhook management
 */

import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import {
  registerWebhookSchema,
  updateWebhookSchema,
  webhookIdSchema,
} from '../schemas/webhook.schema';

const router = Router();
const webhookController = WebhookController.getInstance();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook management
 */

/**
 * @swagger
 * /webhooks:
 *   post:
 *     summary: Register a new webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               secret:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Webhook registered successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(registerWebhookSchema),
  webhookController.registerWebhook,
);

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: List all webhooks
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', AuthMiddleware.authenticate, webhookController.listWebhooks);

/**
 * @swagger
 * /webhooks/{id}:
 *   get:
 *     summary: Get webhook details
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(webhookIdSchema),
  webhookController.getWebhook,
);

/**
 * @swagger
 * /webhooks/{id}:
 *   put:
 *     summary: Update webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               secret:
 *                 type: string
 *               description:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  '/:id',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(updateWebhookSchema),
  webhookController.updateWebhook,
);

/**
 * @swagger
 * /webhooks/{id}:
 *   delete:
 *     summary: Delete a webhook
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  AuthMiddleware.authenticate,
  ValidationMiddleware.validate(webhookIdSchema),
  webhookController.deleteWebhook,
);

/**
 * @swagger
 * /webhooks/{id}/test:
 *   post:
 *     summary: Send a test webhook event
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test webhook sent successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/test', AuthMiddleware.authenticate, webhookController.testWebhook);

/**
 * @swagger
 * /webhooks/{id}/deliveries:
 *   get:
 *     summary: Get webhook delivery history
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Webhook delivery history
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/deliveries', AuthMiddleware.authenticate, webhookController.getWebhookDeliveries);

/**
 * @swagger
 * /webhooks/{id}/retry/{deliveryId}:
 *   post:
 *     summary: Retry a failed webhook delivery
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook delivery retry initiated
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/retry/:deliveryId', AuthMiddleware.authenticate, webhookController.retryWebhookDelivery);

/**
 * @swagger
 * /webhooks/{id}/stats:
 *   get:
 *     summary: Get webhook statistics
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook statistics
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/stats', AuthMiddleware.authenticate, webhookController.getWebhookStats);

export default router;
