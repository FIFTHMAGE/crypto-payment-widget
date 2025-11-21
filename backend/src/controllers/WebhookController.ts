/**
 * Webhook Controller
 * Handles webhook registration, delivery, and management
 */

import { Request, Response, NextFunction } from 'express';
import { EnhancedWebhookService } from '../services/EnhancedWebhookService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export class WebhookController {
  private static instance: WebhookController;
  private webhookService: EnhancedWebhookService;

  private constructor() {
    this.webhookService = EnhancedWebhookService.getInstance();
    logger.info('WebhookController initialized.');
  }

  public static getInstance(): WebhookController {
    if (!WebhookController.instance) {
      WebhookController.instance = new WebhookController();
    }
    return WebhookController.instance;
  }

  /**
   * POST /api/webhooks
   * Register a new webhook endpoint
   */
  public registerWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { url, events, secret, description } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Registering webhook for merchant ${merchantId}: ${url}`);

      const webhookId = await this.webhookService.registerWebhook({
        url,
        events: events || ['payment.*'],
        merchantId,
        secret,
        description,
      });

      sendSuccessResponse(res, 201, 'Webhook registered successfully', {
        id: webhookId,
        url,
        events,
      });
    } catch (error) {
      logger.error('Error registering webhook:', error);
      sendErrorResponse(res, 500, 'Failed to register webhook', error);
    }
  };

  /**
   * GET /api/webhooks
   * List all webhooks for a merchant
   */
  public listWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Listing webhooks for merchant ${merchantId}`);

      const webhooks = await this.webhookService.getWebhooksByMerchant(merchantId);

      sendSuccessResponse(res, 200, 'Webhooks retrieved successfully', webhooks);
    } catch (error) {
      logger.error('Error listing webhooks:', error);
      sendErrorResponse(res, 500, 'Failed to retrieve webhooks', error);
    }
  };

  /**
   * GET /api/webhooks/:id
   * Get webhook details
   */
  public getWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Fetching webhook ${id} for merchant ${merchantId}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      sendSuccessResponse(res, 200, 'Webhook retrieved successfully', webhook);
    } catch (error) {
      logger.error('Error fetching webhook:', error);
      sendErrorResponse(res, 500, 'Failed to retrieve webhook', error);
    }
  };

  /**
   * PUT /api/webhooks/:id
   * Update webhook configuration
   */
  public updateWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { url, events, secret, description, enabled } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Updating webhook ${id} for merchant ${merchantId}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      await this.webhookService.updateWebhook(id, {
        url,
        events,
        secret,
        description,
        enabled,
      });

      sendSuccessResponse(res, 200, 'Webhook updated successfully', { id });
    } catch (error) {
      logger.error('Error updating webhook:', error);
      sendErrorResponse(res, 500, 'Failed to update webhook', error);
    }
  };

  /**
   * DELETE /api/webhooks/:id
   * Delete a webhook
   */
  public deleteWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Deleting webhook ${id} for merchant ${merchantId}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      await this.webhookService.deleteWebhook(id);

      sendSuccessResponse(res, 200, 'Webhook deleted successfully', { id });
    } catch (error) {
      logger.error('Error deleting webhook:', error);
      sendErrorResponse(res, 500, 'Failed to delete webhook', error);
    }
  };

  /**
   * POST /api/webhooks/:id/test
   * Send a test webhook event
   */
  public testWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Testing webhook ${id} for merchant ${merchantId}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      // Send test event
      await this.webhookService.sendEvent(
        {
          type: 'webhook.test',
          data: {
            message: 'This is a test webhook event',
            timestamp: new Date().toISOString(),
            webhookId: id,
          },
          timestamp: new Date(),
        },
        [id],
      );

      sendSuccessResponse(res, 200, 'Test webhook sent successfully');
    } catch (error) {
      logger.error('Error testing webhook:', error);
      sendErrorResponse(res, 500, 'Failed to send test webhook', error);
    }
  };

  /**
   * GET /api/webhooks/:id/deliveries
   * Get webhook delivery history
   */
  public getWebhookDeliveries = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Fetching webhook deliveries for ${id}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      const deliveries = await this.webhookService.getDeliveryHistory(
        id,
        parseInt(limit as string, 10),
        parseInt(offset as string, 10),
      );

      sendSuccessResponse(res, 200, 'Webhook deliveries retrieved successfully', deliveries);
    } catch (error) {
      logger.error('Error fetching webhook deliveries:', error);
      sendErrorResponse(res, 500, 'Failed to retrieve webhook deliveries', error);
    }
  };

  /**
   * POST /api/webhooks/:id/retry/:deliveryId
   * Retry a failed webhook delivery
   */
  public retryWebhookDelivery = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id, deliveryId } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Retrying webhook delivery ${deliveryId} for webhook ${id}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      await this.webhookService.retryDelivery(deliveryId);

      sendSuccessResponse(res, 200, 'Webhook delivery retry initiated');
    } catch (error) {
      logger.error('Error retrying webhook delivery:', error);
      sendErrorResponse(res, 500, 'Failed to retry webhook delivery', error);
    }
  };

  /**
   * GET /api/webhooks/:id/stats
   * Get webhook statistics
   */
  public getWebhookStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        sendErrorResponse(res, 401, 'Authentication required');
        return;
      }

      logger.debug(`Fetching webhook stats for ${id}`);

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        sendErrorResponse(res, 404, 'Webhook not found');
        return;
      }

      // Verify ownership
      if (webhook.merchantId !== merchantId) {
        sendErrorResponse(res, 403, 'Access denied');
        return;
      }

      const stats = await this.webhookService.getWebhookStats(id);

      sendSuccessResponse(res, 200, 'Webhook statistics retrieved successfully', stats);
    } catch (error) {
      logger.error('Error fetching webhook stats:', error);
      sendErrorResponse(res, 500, 'Failed to retrieve webhook statistics', error);
    }
  };
}
