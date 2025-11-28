import { type NextFunction, type Request, type Response } from 'express';

import { config } from '../config';

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response, next: NextFunction) => void;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

interface RequestRecord {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

// In-memory rate limit storage (use Redis in production)
const requestCounts = new Map<string, RequestRecord>();

/**
 * Get client identifier from request
 */
const defaultKeyGenerator = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Default rate limit handler
 */
const defaultHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(429).json({
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  });
};

/**
 * Create rate limiter middleware
 */
export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = config.rateLimit.windowMs,
    max = config.rateLimit.max,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    keyGenerator = defaultKeyGenerator,
    handler,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize record if doesn't exist
    if (!requestCounts.has(key)) {
      requestCounts.set(key, { timestamps: [], blocked: false });
    }

    const record = requestCounts.get(key)!;

    // Check if currently blocked
    if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
      const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', record.blockedUntil.toString());

      if (handler) {
        handler(req, res, next);
      } else {
        res.status(statusCode).json({
          success: false,
          error: message,
          retryAfter,
        });
      }
      return;
    }

    // Clear block if expired
    if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
      record.blocked = false;
      record.blockedUntil = undefined;
    }

    // Filter timestamps within window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    // Check if over limit
    if (record.timestamps.length >= max) {
      record.blocked = true;
      record.blockedUntil = now + windowMs;

      res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', record.blockedUntil.toString());

      if (handler) {
        handler(req, res, next);
      } else {
        res.status(statusCode).json({
          success: false,
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }
      return;
    }

    // Track this request
    record.timestamps.push(now);

    // Set rate limit headers
    const remaining = max - record.timestamps.length;
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', (now + windowMs).toString());

    // Periodic cleanup (1% chance on each request)
    if (Math.random() < 0.01) {
      cleanupOldRecords(windowMs);
    }

    next();
  };
};

/**
 * Clean up old records from memory
 */
const cleanupOldRecords = (windowMs: number): void => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0 && !record.blocked) {
      requestCounts.delete(key);
    }
  }
};

/**
 * Get rate limit info for a key
 */
export const getRateLimitInfo = (
  req: Request,
  options: RateLimitOptions = {}
): RateLimitInfo | null => {
  const { windowMs = config.rateLimit.windowMs, max = config.rateLimit.max } = options;
  const key = (options.keyGenerator || defaultKeyGenerator)(req);
  const record = requestCounts.get(key);

  if (!record) {
    return null;
  }

  const now = Date.now();
  const recentTimestamps = record.timestamps.filter((t) => now - t < windowMs);

  return {
    limit: max,
    remaining: Math.max(0, max - recentTimestamps.length),
    resetTime: now + windowMs,
  };
};

/**
 * Reset rate limit for a key
 */
export const resetRateLimit = (key: string): boolean => {
  return requestCounts.delete(key);
};

// Default rate limiter using config values
export const rateLimiter = createRateLimiter();

export default {
  createRateLimiter,
  rateLimiter,
  getRateLimitInfo,
  resetRateLimit,
};

