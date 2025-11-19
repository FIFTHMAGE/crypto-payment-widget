/**
 * Payment validation utilities
 * @module lib/validation/payment
 */

import { z } from 'zod';

/**
 * Payment amount validation schema
 */
export const paymentAmountSchema = z
  .string()
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  });

/**
 * Ethereum address validation schema
 */
export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Payment request validation schema
 */
export const paymentRequestSchema = z.object({
  amount: paymentAmountSchema,
  recipient: ethereumAddressSchema,
  token: ethereumAddressSchema.optional(),
  memo: z.string().max(500).optional(),
});

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;

