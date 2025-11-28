import { createHmac, randomBytes } from 'crypto';

import { logger } from '../utils/logger';

/**
 * Webhook Service
 * Handles webhook registration and event delivery
 */

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
  | 'test';

export interface WebhookData {
  url: string;
  events: WebhookEventType[];
  secret?: string;
  description?: string;
}

export interface Webhook extends Required<Omit<WebhookData, 'secret'>> {
  id: string;
  secret: string;
  active: boolean;
  createdAt: number;
  lastTriggered: number | null;
  successCount: number;
  failureCount: number;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface WebhookDeliveryResult {
  success: boolean;
  status?: number;
  error?: string;
}

export interface WebhookTriggerResult {
  successful: number;
  failed: number;
  total: number;
}

// In-memory storage (use database in production)
const webhooks = new Map<string, Webhook>();

/**
 * Generate webhook secret
 */
const generateSecret = (): string => {
  return `whsec_${randomBytes(24).toString('hex')}`;
};

/**
 * Generate HMAC signature for payload
 */
const generateSignature = (payload: WebhookPayload, secret: string): string => {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
};

/**
 * Generate webhook ID
 */
const generateId = (): string => {
  return `wh_${Date.now()}_${randomBytes(8).toString('hex')}`;
};

/**
 * Register a new webhook
 */
export const registerWebhook = (webhookData: WebhookData): Webhook => {
  const { url, events, secret, description } = webhookData;

  if (!url || !events || events.length === 0) {
    throw new Error('URL and events are required');
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid webhook URL');
  }

  const webhook: Webhook = {
    id: generateId(),
    url,
    events,
    secret: secret || generateSecret(),
    description: description || '',
    active: true,
    createdAt: Date.now(),
    lastTriggered: null,
    successCount: 0,
    failureCount: 0,
  };

  webhooks.set(webhook.id, webhook);
  logger.info(`Webhook registered: ${webhook.id} for ${url}`);

  return webhook;
};

/**
 * Get all webhooks
 */
export const getAllWebhooks = (): Webhook[] => {
  return Array.from(webhooks.values());
};

/**
 * Get webhook by ID
 */
export const getWebhookById = (id: string): Webhook => {
  const webhook = webhooks.get(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }
  return webhook;
};

/**
 * Update a webhook
 */
export const updateWebhook = (
  id: string,
  updates: Partial<WebhookData> & { active?: boolean }
): Webhook => {
  const webhook = webhooks.get(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  const updated: Webhook = {
    ...webhook,
    ...updates,
    id: webhook.id,
    createdAt: webhook.createdAt,
    secret: webhook.secret, // Don't allow secret update via this method
  };

  webhooks.set(id, updated);
  logger.info(`Webhook updated: ${id}`);

  return updated;
};

/**
 * Delete a webhook
 */
export const deleteWebhook = (id: string): { success: boolean } => {
  const webhook = webhooks.get(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  webhooks.delete(id);
  logger.info(`Webhook deleted: ${id}`);

  return { success: true };
};

/**
 * Deliver a webhook
 */
const deliverWebhook = async (
  webhook: Webhook,
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<WebhookDeliveryResult> => {
  const webhookPayload: WebhookPayload = {
    event: eventType,
    timestamp: Date.now(),
    data: payload,
  };

  const signature = generateSignature(webhookPayload, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-Id': webhook.id,
        'X-Webhook-Timestamp': webhookPayload.timestamp.toString(),
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Update webhook stats
    webhook.lastTriggered = Date.now();
    webhook.successCount++;
    webhooks.set(webhook.id, webhook);

    logger.info(`Webhook delivered successfully: ${webhook.id} to ${webhook.url}`);

    return { success: true, status: response.status };
  } catch (error) {
    // Update failure count
    webhook.failureCount++;
    webhooks.set(webhook.id, webhook);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Webhook delivery failed: ${webhook.id} to ${webhook.url}`, { error: errorMessage });

    return { success: false, error: errorMessage };
  }
};

/**
 * Trigger webhooks for an event
 */
export const triggerWebhooks = async (
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<WebhookTriggerResult> => {
  const activeWebhooks = Array.from(webhooks.values()).filter(
    (wh) => wh.active && wh.events.includes(eventType)
  );

  logger.info(`Triggering ${activeWebhooks.length} webhooks for event: ${eventType}`);

  const results = await Promise.allSettled(
    activeWebhooks.map((webhook) => deliverWebhook(webhook, eventType, payload))
  );

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as WebhookDeliveryResult).success
  ).length;
  const failed = results.length - successful;

  logger.info(`Webhook delivery complete: ${successful} successful, ${failed} failed`);

  return { successful, failed, total: activeWebhooks.length };
};

/**
 * Test webhook delivery
 */
export const testWebhook = async (id: string): Promise<WebhookDeliveryResult> => {
  const webhook = webhooks.get(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  const testPayload = {
    test: true,
    message: 'This is a test webhook delivery',
    timestamp: Date.now(),
  };

  return deliverWebhook(webhook, 'test', testPayload);
};

/**
 * Rotate webhook secret
 */
export const rotateSecret = (id: string): { secret: string } => {
  const webhook = webhooks.get(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  webhook.secret = generateSecret();
  webhooks.set(id, webhook);
  logger.info(`Webhook secret rotated: ${id}`);

  return { secret: webhook.secret };
};

/**
 * Clear all webhooks (for testing)
 */
export const clearWebhooks = (): void => {
  webhooks.clear();
  logger.info('All webhooks cleared');
};

export const webhookService = {
  registerWebhook,
  getAllWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  triggerWebhooks,
  testWebhook,
  rotateSecret,
  clearWebhooks,
};

export default webhookService;

