/**
 * Webhook Validation Schemas
 * Zod schemas for webhook endpoints
 */

import { z } from 'zod';

export const webhookSchemas = {
  createWebhook: z.object({
    url: z.string().url('Invalid webhook URL'),
    events: z.array(z.string()).min(1, 'At least one event is required'),
    secret: z.string().optional(),
    description: z.string().optional(),
  }),

  updateWebhook: z.object({
    url: z.string().url('Invalid webhook URL').optional(),
    events: z.array(z.string()).min(1, 'At least one event is required').optional(),
    secret: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  }),
};

