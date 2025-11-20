/**
 * Enhanced Cache Service with multi-layer caching and smart invalidation
 * @module services/CacheService
 */

import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  memoryUsed?: number;
}

export enum CacheStrategy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In First Out
  TTL = 'ttl' // Time To Live
}

export class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: any; expiresAt: number; tags: string[] }> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0
  };
  
  private defaultTTL = 3600; // 1 hour
  private maxMemoryCacheSize = 1000;
  private strategy: CacheStrategy = CacheStrategy.LRU;
  private accessCount: Map<string, number> = new Map();

  constructor(redisUrl?: string) {
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
      this.redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);

    // Try memory cache first
    const memValue = this.getFromMemory<T>(prefixedKey);
    if (memValue !== null) {
      this.recordHit();
      return memValue;
    }

    // Try Redis if available
    if (this.redis) {
      try {
        const redisValue = await this.redis.get(prefixedKey);
        if (redisValue) {
          const parsed = options?.serialize !== false 
            ? JSON.parse(redisValue) 
            : redisValue;
          
          // Cache in memory for faster subsequent access
          this.setInMemory(prefixedKey, parsed, options?.ttl || this.defaultTTL, options?.tags);
          
          this.recordHit();
          return parsed as T;
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
    }

    this.recordMiss();
    return null;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);
    const ttl = options?.ttl || this.defaultTTL;

    // Set in memory cache
    this.setInMemory(prefixedKey, value, ttl, options?.tags);

    // Set in Redis if available
    if (this.redis) {
      try {
        const serialized = options?.serialize !== false 
          ? JSON.stringify(value) 
          : value;
        
        if (ttl > 0) {
          await this.redis.setex(prefixedKey, ttl, serialized);
        } else {
          await this.redis.set(prefixedKey, serialized);
        }

        // Store tags for invalidation
        if (options?.tags && options.tags.length > 0) {
          for (const tag of options.tags) {
            await this.redis.sadd(`tag:${tag}`, prefixedKey);
          }
        }
      } catch (error) {
        console.error('Redis set error:', error);
      }
    }

    this.stats.sets++;
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);

    // Delete from memory
    this.memoryCache.delete(prefixedKey);
    this.accessCount.delete(prefixedKey);

    // Delete from Redis
    if (this.redis) {
      try {
        await this.redis.del(prefixedKey);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }

    this.stats.deletes++;
  }

  /**
   * Delete by tag
   */
  async deleteByTag(tag: string): Promise<number> {
    let deleted = 0;

    // Delete from memory
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        this.memoryCache.delete(key);
        deleted++;
      }
    }

    // Delete from Redis
    if (this.redis) {
      try {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
          deleted += keys.length;
        }
      } catch (error) {
        console.error('Redis deleteByTag error:', error);
      }
    }

    this.stats.deletes += deleted;
    return deleted;
  }

  /**
   * Clear all cache
   */
  async clear(prefix?: string): Promise<void> {
    if (prefix) {
      // Clear with prefix
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }

      if (this.redis) {
        try {
          const keys = await this.redis.keys(`${prefix}*`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } catch (error) {
          console.error('Redis clear error:', error);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();
      this.accessCount.clear();

      if (this.redis) {
        try {
          await this.redis.flushdb();
        } catch (error) {
          console.error('Redis flushdb error:', error);
        }
      }
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string, options?: CacheOptions): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);

    // Check memory cache
    if (this.memoryCache.has(prefixedKey)) {
      const entry = this.memoryCache.get(prefixedKey)!;
      if (entry.expiresAt > Date.now()) {
        return true;
      } else {
        this.memoryCache.delete(prefixedKey);
      }
    }

    // Check Redis
    if (this.redis) {
      try {
        const exists = await this.redis.exists(prefixedKey);
        return exists === 1;
      } catch (error) {
        console.error('Redis exists error:', error);
      }
    }

    return false;
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Increment value
   */
  async increment(key: string, amount: number = 1, options?: CacheOptions): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);

    if (this.redis) {
      try {
        return await this.redis.incrby(prefixedKey, amount);
      } catch (error) {
        console.error('Redis increment error:', error);
      }
    }

    // Fallback to memory
    const current = this.getFromMemory<number>(prefixedKey) || 0;
    const newValue = current + amount;
    this.setInMemory(prefixedKey, newValue, options?.ttl || this.defaultTTL);
    return newValue;
  }

  /**
   * Decrement value
   */
  async decrement(key: string, amount: number = 1, options?: CacheOptions): Promise<number> {
    return this.increment(key, -amount, options);
  }

  /**
   * Get multiple keys at once
   */
  async mget<T = any>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    const prefixedKeys = keys.map(k => this.getPrefixedKey(k, options?.prefix));
    const results: (T | null)[] = [];

    for (const key of prefixedKeys) {
      results.push(await this.get<T>(key, options));
    }

    return results;
  }

  /**
   * Set multiple keys at once
   */
  async mset(entries: Array<{ key: string; value: any }>, options?: CacheOptions): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, options);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    if (this.redis) {
      // Get Redis memory usage
      this.redis.info('memory').then((info) => {
        const match = info.match(/used_memory:(\d+)/);
        if (match) {
          this.stats.memoryUsed = parseInt(match[1]);
        }
      }).catch(() => {});
    }

    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0
    };
  }

  /**
   * Set cache strategy
   */
  setStrategy(strategy: CacheStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get prefixed key
   */
  private getPrefixedKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * Get from memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access count for LFU
    if (this.strategy === CacheStrategy.LFU) {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    }

    return entry.value;
  }

  /**
   * Set in memory cache
   */
  private setInMemory(key: string, value: any, ttl: number, tags: string[] = []): void {
    // Evict if needed
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      this.evict();
    }

    const expiresAt = ttl > 0 ? Date.now() + (ttl * 1000) : Infinity;
    this.memoryCache.set(key, { value, expiresAt, tags });

    if (this.strategy === CacheStrategy.LFU) {
      this.accessCount.set(key, 1);
    }
  }

  /**
   * Evict cache entry based on strategy
   */
  private evict(): void {
    if (this.memoryCache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.strategy) {
      case CacheStrategy.LRU:
        // Evict first entry (oldest)
        keyToEvict = this.memoryCache.keys().next().value;
        break;

      case CacheStrategy.LFU:
        // Evict least frequently used
        let minCount = Infinity;
        for (const [key, count] of this.accessCount.entries()) {
          if (count < minCount) {
            minCount = count;
            keyToEvict = key;
          }
        }
        break;

      case CacheStrategy.FIFO:
        // Evict first entry
        keyToEvict = this.memoryCache.keys().next().value;
        break;

      case CacheStrategy.TTL:
        // Evict entry with earliest expiry
        let earliestExpiry = Infinity;
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.expiresAt < earliestExpiry) {
            earliestExpiry = entry.expiresAt;
            keyToEvict = key;
          }
        }
        break;
    }

    if (keyToEvict) {
      this.memoryCache.delete(keyToEvict);
      this.accessCount.delete(keyToEvict);
    }
  }

  /**
   * Record cache hit
   */
  private recordHit(): void {
    this.stats.hits++;
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    this.stats.misses++;
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Singleton instance
export const cacheService = new CacheService(process.env.REDIS_URL);

