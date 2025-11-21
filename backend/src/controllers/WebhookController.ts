/**
 * Webhook Controller
 * Handles webhook management and delivery
 */

import { Request, Response, NextFunction } from 'express';
import { EnhancedWebhookService } from '../services/EnhancedWebhookService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class WebhookController {
  constructor(private webhookService: EnhancedWebhookService) {}

  /**
   * Register a new webhook
   */
  async registerWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, events, secret } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      if (!url) {
        res.status(400).json(errorResponse('URL is required'));
        return;
      }

      if (!events || !Array.isArray(events) || events.length === 0) {
        res.status(400).json(errorResponse('Events array is required'));
        return;
      }

      const webhookId = await this.webhookService.registerWebhook(
        merchantId,
        url,
        events,
        secret,
      );

      res.status(201).json(
        successResponse({ webhookId }, 'Webhook registered successfully'),
      );
    } catch (error) {
      logger.error('Error registering webhook:', error);
      next(error);
    }
  }

  /**
   * Get all webhooks for a merchant
   */
  async getWebhooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      const webhooks = await this.webhookService.getMerchantWebhooks(merchantId);

      res.json(successResponse(webhooks, 'Webhooks retrieved successfully'));
    } catch (error) {
      logger.error('Error getting webhooks:', error);
      next(error);
    }
  }

  /**
   * Update a webhook
   */
  async updateWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { webhookId } = req.params;
      const { url, events, secret, active } = req.body;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      await this.webhookService.updateWebhook(webhookId, {
        url,
        events,
        secret,
        active,
      });

      res.json(successResponse(null, 'Webhook updated successfully'));
    } catch (error) {
      logger.error('Error updating webhook:', error);
      next(error);
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { webhookId } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      await this.webhookService.deleteWebhook(webhookId, merchantId);

      res.json(successResponse(null, 'Webhook deleted successfully'));
    } catch (error) {
      logger.error('Error deleting webhook:', error);
      next(error);
    }
  }

  /**
   * Get webhook delivery history
   */
  async getDeliveryHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { webhookId } = req.params;
      const { page = '0', limit = '20' } = req.query;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      const history = await this.webhookService.getDeliveryHistory(
        webhookId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
      );

      res.json(successResponse(history, 'Delivery history retrieved successfully'));
    } catch (error) {
      logger.error('Error getting delivery history:', error);
      next(error);
    }
  }

  /**
   * Retry failed webhook delivery
   */
  async retryDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deliveryId } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      await this.webhookService.retryDelivery(deliveryId);

      res.json(successResponse(null, 'Retry initiated successfully'));
    } catch (error) {
      logger.error('Error retrying delivery:', error);
      next(error);
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { webhookId } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      const testPayload = {
        event: 'test',
        data: {
          message: 'This is a test webhook delivery',
          timestamp: new Date().toISOString(),
        },
      };

      const result = await this.webhookService.sendWebhook(webhookId, testPayload);

      res.json(
        successResponse(
          { success: result.success, response: result.response },
          result.success ? 'Test webhook delivered successfully' : 'Test webhook failed',
        ),
      );
    } catch (error) {
      logger.error('Error testing webhook:', error);
      next(error);
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { webhookId } = req.params;
      const merchantId = req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Unauthorized'));
        return;
      }

      const stats = await this.webhookService.getWebhookStats(webhookId);

      res.json(successResponse(stats, 'Webhook statistics retrieved successfully'));
    } catch (error) {
      logger.error('Error getting webhook stats:', error);
      next(error);
    }
  }
}

