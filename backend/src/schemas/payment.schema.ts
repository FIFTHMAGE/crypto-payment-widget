import { z } from 'zod';

export const PaymentSchema = z.object({
  amount: z.string(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  token: z.string(),
  memo: z.string().optional(),
});
