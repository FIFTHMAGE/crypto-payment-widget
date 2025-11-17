/** Rate Limiting with Redis */
import { redis } from '../cache/redis';
export const rateLimit = async (key: string, limit = 100, window = 60) => {
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, window);
  return current <= limit;
};

