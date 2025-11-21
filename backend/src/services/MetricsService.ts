/**
 * Metrics Service
 * Provides real-time performance metrics and monitoring
 */

import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  requestCount: number;
  errorCount: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface EndpointMetrics {
  endpoint: string;
  method: string;
  count: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  lastAccessed: Date;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  database: {
    connected: boolean;
    poolSize: number;
    activeQueries: number;
  };
  cache: {
    connected: boolean;
    hitRate: number;
    memoryUsage: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export class MetricsService {
  private redis: RedisClientType;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private endpointMetrics: Map<string, EndpointMetrics> = new Map();
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  constructor(
    private db: Pool,
    redisUrl: string,
  ) {
    this.redis = createClient({ url: redisUrl });
    this.startTime = Date.now();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    try {
      await this.redis.connect();
      logger.info('Metrics Redis connected');
    } catch (error) {
      logger.error('Error connecting to Metrics Redis:', error);
    }
  }

  /**
   * Record API request
   */
  recordRequest(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
  ): void {
    this.requestCount++;

    if (statusCode >= 400) {
      this.errorCount++;
    }

    // Update endpoint metrics
    const key = `${method}:${endpoint}`;
    const existing = this.endpointMetrics.get(key);

    if (existing) {
      existing.count++;
      existing.avgResponseTime =
        (existing.avgResponseTime * (existing.count - 1) + responseTime) / existing.count;
      existing.minResponseTime = Math.min(existing.minResponseTime, responseTime);
      existing.maxResponseTime = Math.max(existing.maxResponseTime, responseTime);
      existing.errorRate = statusCode >= 400 ? (existing.errorRate + 1) / existing.count : existing.errorRate;
      existing.lastAccessed = new Date();
    } else {
      this.endpointMetrics.set(key, {
        endpoint,
        method,
        count: 1,
        avgResponseTime: responseTime,
        minResponseTime: responseTime,
        maxResponseTime: responseTime,
        errorRate: statusCode >= 400 ? 1 : 0,
        lastAccessed: new Date(),
      });
    }

    // Store in Redis for real-time tracking
    this.storeMetricInRedis('request', {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
    });
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  /**
   * Store metric in Redis
   */
  private async storeMetricInRedis(type: string, data: unknown): Promise<void> {
    try {
      const key = `metrics:${type}:${Date.now()}`;
      await this.redis.setEx(key, 3600, JSON.stringify(data)); // Expire after 1 hour
    } catch (error) {
      logger.error('Error storing metric in Redis:', error);
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date(),
      responseTime: this.getAverageResponseTime(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      activeConnections: this.db.totalCount,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  /**
   * Get average response time
   */
  private getAverageResponseTime(): number {
    if (this.endpointMetrics.size === 0) return 0;

    let totalResponseTime = 0;
    let totalRequests = 0;

    this.endpointMetrics.forEach(metric => {
      totalResponseTime += metric.avgResponseTime * metric.count;
      totalRequests += metric.count;
    });

    return totalRequests > 0 ? totalResponseTime / totalRequests : 0;
  }

  /**
   * Get endpoint metrics
   */
  getEndpointMetrics(limit: number = 10): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get slowest endpoints
   */
  getSlowestEndpoints(limit: number = 10): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values())
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  /**
   * Get endpoints with most errors
   */
  getEndpointsWithMostErrors(limit: number = 10): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values())
      .filter(m => m.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, limit);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const uptime = (Date.now() - this.startTime) / 1000;
    const avgResponseTime = this.getAverageResponseTime();
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    // Check database health
    let dbConnected = false;
    let activeQueries = 0;
    try {
      await this.db.query('SELECT 1');
      dbConnected = true;
      activeQueries = this.db.totalCount - this.db.idleCount;
    } catch (error) {
      logger.error('Database health check failed:', error);
    }

    // Check cache health
    let cacheConnected = false;
    let cacheMemoryUsage = 0;
    try {
      await this.redis.ping();
      cacheConnected = true;
      const info = await this.redis.info('memory');
      const match = info.match(/used_memory:(\d+)/);
      if (match) {
        cacheMemoryUsage = parseInt(match[1], 10);
      }
    } catch (error) {
      logger.error('Cache health check failed:', error);
    }

    // Determine overall status
    let status: SystemHealth['status'] = 'healthy';
    if (!dbConnected || !cacheConnected || errorRate > 10 || avgResponseTime > 1000) {
      status = 'degraded';
    }
    if (!dbConnected || errorRate > 50 || avgResponseTime > 5000) {
      status = 'unhealthy';
    }

    return {
      status,
      uptime,
      database: {
        connected: dbConnected,
        poolSize: this.db.totalCount,
        activeQueries,
      },
      cache: {
        connected: cacheConnected,
        hitRate: this.getCacheHitRate(),
        memoryUsage: cacheMemoryUsage,
      },
      api: {
        requestsPerMinute: (this.requestCount / uptime) * 60,
        averageResponseTime: avgResponseTime,
        errorRate,
      },
    };
  }

  /**
   * Get payment metrics from database
   */
  async getPaymentMetrics(period: 'hour' | 'day' | 'week' | 'month' = 'day') {
    let interval: string;
    let groupBy: string;

    switch (period) {
      case 'hour':
        interval = '1 hour';
        groupBy = 'minute';
        break;
      case 'day':
        interval = '1 day';
        groupBy = 'hour';
        break;
      case 'week':
        interval = '7 days';
        groupBy = 'day';
        break;
      case 'month':
        interval = '30 days';
        groupBy = 'day';
        break;
    }

    const query = `
      SELECT 
        date_trunc($1, created_at) as period,
        COUNT(*) as transaction_count,
        SUM(amount::numeric)::text as total_volume,
        AVG(amount::numeric)::text as avg_amount,
        COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM payments
      WHERE created_at > NOW() - INTERVAL '${interval}'
      GROUP BY date_trunc($1, created_at)
      ORDER BY period ASC
    `;

    const result = await this.db.query(query, [groupBy]);
    return result.rows;
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    const [systemHealth, currentMetrics, topEndpoints, slowEndpoints] = await Promise.all([
      this.getSystemHealth(),
      Promise.resolve(this.getCurrentMetrics()),
      Promise.resolve(this.getEndpointMetrics(5)),
      Promise.resolve(this.getSlowestEndpoints(5)),
    ]);

    return {
      system: systemHealth,
      current: currentMetrics,
      topEndpoints,
      slowEndpoints,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.endpointMetrics.clear();
    this.startTime = Date.now();
  }

  /**
   * Export metrics for external monitoring
   */
  exportPrometheusMetrics(): string {
    const metrics: string[] = [];

    // API metrics
    metrics.push(`# HELP api_requests_total Total number of API requests`);
    metrics.push(`# TYPE api_requests_total counter`);
    metrics.push(`api_requests_total ${this.requestCount}`);

    metrics.push(`# HELP api_errors_total Total number of API errors`);
    metrics.push(`# TYPE api_errors_total counter`);
    metrics.push(`api_errors_total ${this.errorCount}`);

    // Cache metrics
    metrics.push(`# HELP cache_hits_total Total number of cache hits`);
    metrics.push(`# TYPE cache_hits_total counter`);
    metrics.push(`cache_hits_total ${this.cacheHits}`);

    metrics.push(`# HELP cache_misses_total Total number of cache misses`);
    metrics.push(`# TYPE cache_misses_total counter`);
    metrics.push(`cache_misses_total ${this.cacheMisses}`);

    // Memory metrics
    const memUsage = process.memoryUsage();
    metrics.push(`# HELP process_memory_bytes Process memory usage in bytes`);
    metrics.push(`# TYPE process_memory_bytes gauge`);
    metrics.push(`process_memory_bytes{type="rss"} ${memUsage.rss}`);
    metrics.push(`process_memory_bytes{type="heapTotal"} ${memUsage.heapTotal}`);
    metrics.push(`process_memory_bytes{type="heapUsed"} ${memUsage.heapUsed}`);

    return metrics.join('\n');
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Metrics service closed');
    } catch (error) {
      logger.error('Error closing metrics service:', error);
    }
  }
}

