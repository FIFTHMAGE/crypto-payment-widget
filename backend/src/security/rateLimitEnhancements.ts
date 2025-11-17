/** Rate Limiting Enhancements */
import { rateLimit } from '../rateLimit/limiter';
export const enhancedRateLimit = async (key: string, tier = 'standard') => {
  const limits = { basic: 10, standard: 100, premium: 1000 };
  return rateLimit(key, limits[tier as keyof typeof limits]);
};

