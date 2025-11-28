import { logger } from '../utils/logger';

/**
 * Cache Service
 * In-memory caching with TTL support (use Redis in production)
 */

export interface CacheItem<T = unknown> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  keys: string[];
  hits: number;
  misses: number;
  hitRate: number;
}

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
}

class CacheService {
  private cache: Map<string, CacheItem>;
  private ttlTimers: Map<string, NodeJS.Timeout>;
  private hits: number;
  private misses: number;
  private defaultTtl: number;

  constructor(defaultTtl = 3600000) {
    this.cache = new Map();
    this.ttlTimers = new Map();
    this.hits = 0;
    this.misses = 0;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTtl): void {
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key)!);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });

    // Set TTL timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.ttlTimers.set(key, timer);
    logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    this.hits++;
    logger.debug(`Cache hit: ${key}`);
    return item.value as T;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key)!);
      this.ttlTimers.delete(key);
    }

    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.ttlTimers.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTtl
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Delete keys by pattern (prefix)
   */
  deleteByPrefix(prefix: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
        deleted++;
      }
    }
    logger.debug(`Deleted ${deleted} keys with prefix: ${prefix}`);
    return deleted;
  }

  /**
   * Get remaining TTL for a key
   */
  getTtl(key: string): number | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    const elapsed = Date.now() - item.timestamp;
    return Math.max(0, item.ttl - elapsed);
  }

  /**
   * Refresh TTL for a key
   */
  touch(key: string, ttl?: number): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    const newTtl = ttl || item.ttl;
    this.set(key, item.value, newTtl);
    return true;
  }

  /**
   * Get all values matching a prefix
   */
  getByPrefix<T>(prefix: string): Map<string, T> {
    const result = new Map<string, T>();
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(prefix)) {
        result.set(key, item.value as T);
      }
    }
    return result;
  }
}

export const cacheService = new CacheService();

export default cacheService;
