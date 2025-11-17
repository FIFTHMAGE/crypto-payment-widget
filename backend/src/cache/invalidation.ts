/** Cache Invalidation Strategy */
import { redis } from './redis';
export const invalidateCache = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
};
export const invalidatePayment = (id: string) => invalidateCache(`payment:${id}*`);

