import { type NextFunction, type Request, type Response } from 'express';

import { logger } from '../utils/logger';

export interface Webhook {
  id: number;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  secret?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WebhookEventType =
  | 'payment.created'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'transaction.created'
  | 'transaction.confirmed'
  | 'transaction.failed'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.renewed';

export interface WebhookEvent {
  id: number;
  type: WebhookEventType;
  data: Record<string, unknown>;
  timestamp: string;
  webhookId?: number;
  deliveryStatus?: 'pending' | 'delivered' | 'failed';
  retryCount?: number;
}

interface RegisterWebhookBody {
  url: string;
  events?: WebhookEventType[];
  secret?: string;
}

interface WebhookParams {
  id: string;
}

interface WebhookResponse {
  success: boolean;
  data?: Webhook | Webhook[] | WebhookEvent;
  message?: string;
  error?: string;
}

// In-memory storage (use database in production)
const webhooks: Webhook[] = [];
const webhookEvents: WebhookEvent[] = [];

/**
 * @route POST /api/v1/webhooks
 * @desc Register a new webhook
 */
export const registerWebhook = async (
  req: Request<object, WebhookResponse, RegisterWebhookBody>,
  res: Response<WebhookResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { url, events, secret } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        error: 'Webhook URL is required',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: 'Invalid webhook URL format',
      });
      return;
    }

    const webhook: Webhook = {
      id: webhooks.length + 1,
      url,
      events: events || ['transaction.created', 'transaction.confirmed'],
      active: true,
      secret,
      createdAt: new Date().toISOString(),
    };

    webhooks.push(webhook);
    logger.info(`Webhook registered: ${url}`);

    res.status(201).json({
      success: true,
      data: webhook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/webhooks
 * @desc Get all registered webhooks
 */
export const getWebhooks = async (
  _req: Request,
  res: Response<WebhookResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: webhooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/webhooks/:id
 * @desc Get a webhook by ID
 */
export const getWebhookById = async (
  req: Request<WebhookParams>,
  res: Response<WebhookResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const webhook = webhooks.find((w) => w.id === parseInt(id, 10));

    if (!webhook) {
      res.status(404).json({
        success: false,
        error: 'Webhook not found',
      });
      return;
    }

    res.json({
      success: true,
      data: webhook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/v1/webhooks/:id
 * @desc Delete a webhook
 */
export const deleteWebhook = async (
  req: Request<WebhookParams>,
  res: Response<WebhookResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const index = webhooks.findIndex((w) => w.id === parseInt(id, 10));

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Webhook not found',
      });
      return;
    }

    webhooks.splice(index, 1);
    logger.info(`Webhook deleted: ${id}`);

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PATCH /api/v1/webhooks/:id
 * @desc Update a webhook
 */
export const updateWebhook = async (
  req: Request<WebhookParams, WebhookResponse, Partial<RegisterWebhookBody>>,
  res: Response<WebhookResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const webhook = webhooks.find((w) => w.id === parseInt(id, 10));

    if (!webhook) {
      res.status(404).json({
        success: false,
        error: 'Webhook not found',
      });
      return;
    }

    const { url, events, secret } = req.body;
    if (url) webhook.url = url;
    if (events) webhook.events = events;
    if (secret) webhook.secret = secret;
    webhook.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: webhook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger a webhook event (internal use)
 */
export const triggerWebhook = async (
  eventType: WebhookEventType,
  data: Record<string, unknown>
): Promise<WebhookEvent> => {
  const event: WebhookEvent = {
    id: webhookEvents.length + 1,
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
    deliveryStatus: 'pending',
    retryCount: 0,
  };

  webhookEvents.push(event);

  // Find matching webhooks
  const matchingWebhooks = webhooks.filter(
    (w) => w.active && w.events.includes(eventType)
  );

  // In production, send HTTP POST requests to webhook URLs
  for (const webhook of matchingWebhooks) {
    logger.info(`Webhook triggered: ${webhook.url} for event ${eventType}`);
    // await sendWebhookRequest(webhook, event);
  }

  return event;
};

export const webhookController = {
  registerWebhook,
  getWebhooks,
  getWebhookById,
  deleteWebhook,
  updateWebhook,
  triggerWebhook,
};

export default webhookController;
