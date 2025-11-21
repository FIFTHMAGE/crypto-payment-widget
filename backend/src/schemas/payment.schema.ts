/**
 * Payment validation schemas
 * @module schemas
 */

import { z } from 'zod';

export const createPaymentSchema = z.object({
  merchantId: z.string().uuid(),
  payerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  payeeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string().min(1).max(10),
  network: z.enum(['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism']),
  metadata: z.record(z.any()).optional(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  metadata: z.record(z.any()).optional(),
});

export const listPaymentsSchema = z.object({
  merchantId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  network: z.enum(['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const paymentIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>;
export type PaymentIdParam = z.infer<typeof paymentIdSchema>;
