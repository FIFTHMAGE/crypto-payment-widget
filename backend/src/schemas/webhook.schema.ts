/**
 * Webhook Validation Schemas
 * Zod schemas for webhook-related requests
 */

import { z } from 'zod';

/**
 * Webhook registration schema
 */
export const registerWebhookSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid webhook URL'),
    events: z
      .array(z.string())
      .min(1, 'At least one event type is required')
      .default(['payment.*']),
    secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
    description: z.string().max(500, 'Description too long').optional(),
  }),
});

/**
 * Webhook update schema
 */
export const updateWebhookSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid webhook ID'),
  }),
  body: z.object({
    url: z.string().url('Invalid webhook URL').optional(),
    events: z.array(z.string()).min(1, 'At least one event type is required').optional(),
    secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
    description: z.string().max(500, 'Description too long').optional(),
    enabled: z.boolean().optional(),
  }),
});

/**
 * Webhook ID param schema
 */
export const webhookIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid webhook ID'),
  }),
});

/**
 * Webhook delivery history query schema
 */
export const webhookDeliveryHistorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid webhook ID'),
  }),
  query: z.object({
    limit: z
      .string()
      .optional()
      .default('50')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    offset: z
      .string()
      .optional()
      .default('0')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 0, 'Offset must be non-negative'),
  }),
});

/**
 * Retry webhook delivery schema
 */
export const retryWebhookDeliverySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid webhook ID'),
    deliveryId: z.string().uuid('Invalid delivery ID'),
  }),
});

/**
 * Common webhook event types
 */
export const WebhookEventTypes = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_CANCELLED: 'payment.cancelled',
  PAYMENT_REFUNDED: 'payment.refunded',
  ESCROW_CREATED: 'escrow.created',
  ESCROW_FUNDED: 'escrow.funded',
  ESCROW_RELEASED: 'escrow.released',
  ESCROW_DISPUTED: 'escrow.disputed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_PAYMENT_SUCCEEDED: 'subscription.payment.succeeded',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment.failed',
  ALL: '*',
} as const;

export type WebhookEventType = (typeof WebhookEventTypes)[keyof typeof WebhookEventTypes];
