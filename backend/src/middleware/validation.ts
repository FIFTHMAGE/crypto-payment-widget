/** Validation Middleware */
import { z } from 'zod';
export const validatePayment = (req: any, res: any, next: any) => {
  const schema = z.object({ amount: z.string(), address: z.string().startsWith('0x') });
  try { schema.parse(req.body); next(); } catch (err) { res.status(400).json({ error: 'Invalid input' }); }
};

