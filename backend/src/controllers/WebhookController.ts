/**
 * Webhook Controller
 * Handles webhook-related HTTP requests
 */

import { Request, Response } from 'express';
import { EnhancedWebhookService } from '../services/EnhancedWebhookService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class WebhookController {
  constructor(private webhookService: EnhancedWebhookService) {}

  /**
   * Create a new webhook
   */
  async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { url, events, secret } = req.body;
      const merchantId = req.user?.merchantId || req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Merchant ID not found'));
        return;
      }

      const webhook = await this.webhookService.registerWebhook({
        merchantId,
        url,
        events,
        secret,
      });

      res.status(201).json(successResponse(webhook, 'Webhook created successfully'));
    } catch (error) {
      logger.error('Error creating webhook:', error);
      res.status(500).json(errorResponse('Failed to create webhook'));
    }
  }

  /**
   * Get all webhooks
   */
  async getWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.user?.merchantId || req.user?.id;

      if (!merchantId) {
        res.status(401).json(errorResponse('Merchant ID not found'));
        return;
      }

      const webhooks = await this.webhookService.getWebhooksByMerchant(merchantId);
      res.json(successResponse(webhooks));
    } catch (error) {
      logger.error('Error fetching webhooks:', error);
      res.status(500).json(errorResponse('Failed to fetch webhooks'));
    }
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      res.json(successResponse(webhook));
    } catch (error) {
      logger.error('Error fetching webhook:', error);
      res.status(500).json(errorResponse('Failed to fetch webhook'));
    }
  }

  /**
   * Update webhook
   */
  async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      const updated = await this.webhookService.updateWebhook(id, updates);
      res.json(successResponse(updated, 'Webhook updated successfully'));
    } catch (error) {
      logger.error('Error updating webhook:', error);
      res.status(500).json(errorResponse('Failed to update webhook'));
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      await this.webhookService.deleteWebhook(id);
      res.json(successResponse(null, 'Webhook deleted successfully'));
    } catch (error) {
      logger.error('Error deleting webhook:', error);
      res.status(500).json(errorResponse('Failed to delete webhook'));
    }
  }

  /**
   * Test webhook
   */
  async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      const testEvent = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook event',
        },
      };

      await this.webhookService.sendWebhook(webhook, testEvent);
      res.json(successResponse(null, 'Test webhook sent successfully'));
    } catch (error) {
      logger.error('Error testing webhook:', error);
      res.status(500).json(errorResponse('Failed to send test webhook'));
    }
  }

  /**
   * Get webhook deliveries
   */
  async getDeliveries(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      const deliveries = await this.webhookService.getDeliveryHistory(
        id,
        parseInt(limit as string),
        parseInt(offset as string),
      );

      res.json(successResponse(deliveries));
    } catch (error) {
      logger.error('Error fetching webhook deliveries:', error);
      res.status(500).json(errorResponse('Failed to fetch deliveries'));
    }
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(req: Request, res: Response): Promise<void> {
    try {
      const { id, deliveryId } = req.params;
      const merchantId = req.user?.merchantId || req.user?.id;

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        res.status(404).json(errorResponse('Webhook not found'));
        return;
      }

      if (webhook.merchantId !== merchantId) {
        res.status(403).json(errorResponse('Access denied'));
        return;
      }

      await this.webhookService.retryDelivery(deliveryId);
      res.json(successResponse(null, 'Delivery retry initiated'));
    } catch (error) {
      logger.error('Error retrying webhook delivery:', error);
      res.status(500).json(errorResponse('Failed to retry delivery'));
    }
  }
}
