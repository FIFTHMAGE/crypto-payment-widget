import { logger } from '../utils/logger.js'

// Simple in-memory cache (in production, use Redis)
class CacheService {
  constructor() {
    this.cache = new Map()
    this.ttlTimers = new Map()
  }

  set(key, value, ttl = 3600000) {
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key))
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })

    // Set TTL timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)

    this.ttlTimers.set(key, timer)
    logger.debug(`Cache set: ${key}`)
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      logger.debug(`Cache miss: ${key}`)
      return null
    }

    logger.debug(`Cache hit: ${key}`)
    return item.value
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key))
      this.ttlTimers.delete(key)
    }
    
    this.cache.delete(key)
    logger.debug(`Cache deleted: ${key}`)
  }

  clear() {
    // Clear all timers
    for (const timer of this.ttlTimers.values()) {
      clearTimeout(timer)
    }
    
    this.cache.clear()
    this.ttlTimers.clear()
    logger.info('Cache cleared')
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const cacheService = new CacheService()

