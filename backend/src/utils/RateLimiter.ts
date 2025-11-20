/**
 * RateLimiter - Advanced rate limiting utility
 * @module utils/RateLimiter
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (identifier: string) => void;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
  successCount: number;
  failedCount: number;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: Required<RateLimitConfig>;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (id) => id,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      onLimitReached: () => {},
      ...config,
    };

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    info: RateLimitInfo;
  }> {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();

    let record = this.requests.get(key);

    // Initialize or reset if window expired
    if (!record || now >= record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
        successCount: 0,
        failedCount: 0,
      };
      this.requests.set(key, record);
    }

    const allowed = record.count < this.config.maxRequests;

    if (!allowed) {
      this.config.onLimitReached(identifier);
    }

    const info: RateLimitInfo = {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      reset: record.resetTime,
      retryAfter: allowed ? undefined : record.resetTime - now,
    };

    return { allowed, info };
  }

  /**
   * Consume a request
   */
  async consume(identifier: string, success: boolean = true): Promise<RateLimitInfo> {
    const key = this.config.keyGenerator(identifier);
    const record = this.requests.get(key);

    if (!record) {
      throw new Error('Request record not found. Call checkLimit first.');
    }

    // Only increment if not skipping this type of request
    const shouldCount =
      (success && !this.config.skipSuccessfulRequests) ||
      (!success && !this.config.skipFailedRequests);

    if (shouldCount) {
      record.count++;
    }

    if (success) {
      record.successCount++;
    } else {
      record.failedCount++;
    }

    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      reset: record.resetTime,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    this.requests.delete(key);
  }

  /**
   * Get current rate limit info
   */
  getInfo(identifier: string): RateLimitInfo | null {
    const key = this.config.keyGenerator(identifier);
    const record = this.requests.get(key);

    if (!record) {
      return null;
    }

    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      reset: record.resetTime,
    };
  }

  /**
   * Get statistics
   */
  getStats(identifier: string): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    remaining: number;
  } | null {
    const key = this.config.keyGenerator(identifier);
    const record = this.requests.get(key);

    if (!record) {
      return null;
    }

    return {
      totalRequests: record.count,
      successfulRequests: record.successCount,
      failedRequests: record.failedCount,
      remaining: Math.max(0, this.config.maxRequests - record.count),
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

/**
 * Token bucket rate limiter for smooth request distribution
 */
export class TokenBucketRateLimiter {
  private buckets: Map<
    string,
    {
      tokens: number;
      lastRefill: number;
    }
  > = new Map();

  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private keyGenerator: (id: string) => string = (id) => id
  ) {}

  /**
   * Try to consume tokens
   */
  async consume(identifier: string, tokens: number = 1): Promise<{
    allowed: boolean;
    tokensRemaining: number;
    retryAfter?: number;
  }> {
    const key = this.keyGenerator(identifier);
    const now = Date.now();

    let bucket = this.buckets.get(key);

    // Initialize bucket
    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefill: now,
      };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time elapsed
    const timeDelta = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = timeDelta * this.refillRate;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if enough tokens
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return {
        allowed: true,
        tokensRemaining: bucket.tokens,
      };
    }

    // Calculate retry after
    const tokensNeeded = tokens - bucket.tokens;
    const retryAfter = (tokensNeeded / this.refillRate) * 1000; // milliseconds

    return {
      allowed: false,
      tokensRemaining: bucket.tokens,
      retryAfter,
    };
  }

  /**
   * Get current tokens
   */
  getTokens(identifier: string): number {
    const key = this.keyGenerator(identifier);
    const bucket = this.buckets.get(key);

    if (!bucket) {
      return this.capacity;
    }

    // Calculate current tokens with refill
    const now = Date.now();
    const timeDelta = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timeDelta * this.refillRate;

    return Math.min(this.capacity, bucket.tokens + tokensToAdd);
  }

  /**
   * Reset bucket
   */
  reset(identifier: string): void {
    const key = this.keyGenerator(identifier);
    this.buckets.delete(key);
  }
}

/**
 * Sliding window rate limiter for more accurate limiting
 */
export class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private windowMs: number,
    private maxRequests: number,
    private keyGenerator: (id: string) => string = (id) => id
  ) {}

  /**
   * Check and record request
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    reset: number;
  }> {
    const key = this.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or initialize request timestamps
    let timestamps = this.requests.get(key) || [];

    // Remove old timestamps
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Check limit
    const allowed = timestamps.length < this.maxRequests;

    if (allowed) {
      timestamps.push(now);
      this.requests.set(key, timestamps);
    }

    // Calculate reset time (when oldest request expires)
    const reset = timestamps.length > 0 ? timestamps[0] + this.windowMs : now + this.windowMs;

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - timestamps.length),
      reset,
    };
  }

  /**
   * Reset for identifier
   */
  reset(identifier: string): void {
    const key = this.keyGenerator(identifier);
    this.requests.delete(key);
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter((ts) => ts > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

/**
 * Create rate limiter middleware (for Express)
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (req: any, res: any, next: any) => {
    // Use IP address or user ID as identifier
    const identifier = req.user?.id || req.ip || req.connection.remoteAddress;

    const { allowed, info } = await limiter.checkLimit(identifier);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(info.reset).toISOString());

    if (!allowed) {
      if (info.retryAfter) {
        res.setHeader('Retry-After', Math.ceil(info.retryAfter / 1000));
      }
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: info.retryAfter,
      });
    }

    // Track request result
    res.on('finish', () => {
      const success = res.statusCode < 400;
      limiter.consume(identifier, success);
    });

    next();
  };
}

