/**
 * Metrics Service
 * Collects and tracks system performance metrics
 */

import { Pool } from 'pg';
import logger from '../utils/logger';

export interface SystemMetrics {
  timestamp: Date;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  cacheHitRate: number;
  queueDepth: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  successRate: number;
  averageProcessingTime: number;
  totalVolume: string;
  failureRate: number;
  byStatus: Record<string, number>;
  byCurrency: Record<string, number>;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
  databaseConnections: number;
  responseTimeP50: number;
  responseTimeP95: number;
  responseTimeP99: number;
}

export class MetricsService {
  private db: Pool;
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 1000;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Record a metric value
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push(value);

    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  } | null {
    const samples = this.metrics.get(name);

    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sorted.reduce((sum, val) => sum + val, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const now = new Date();

    // Get request rate from last minute
    const requestsPerSecond = this.calculateRate('requests', 60);

    // Get average response time
    const responseTimeStats = this.getMetricStats('response_time');
    const averageResponseTime = responseTimeStats?.avg || 0;

    // Calculate error rate
    const totalRequests = this.getMetricValue('requests_total') || 1;
    const totalErrors = this.getMetricValue('requests_errors') || 0;
    const errorRate = (totalErrors / totalRequests) * 100;

    // Get connection metrics
    const activeConnections = this.getMetricValue('active_connections') || 0;

    // Calculate cache hit rate
    const cacheHits = this.getMetricValue('cache_hits') || 0;
    const cacheMisses = this.getMetricValue('cache_misses') || 0;
    const cacheTotal = cacheHits + cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0;

    // Get queue depth
    const queueDepth = this.getMetricValue('queue_depth') || 0;

    return {
      timestamp: now,
      requestsPerSecond,
      averageResponseTime,
      errorRate,
      activeConnections,
      cacheHitRate,
      queueDepth,
    };
  }

  /**
   * Get payment metrics
   */
  async getPaymentMetrics(timeRange: 'hour' | 'day' | 'week' = 'day'): Promise<PaymentMetrics> {
    try {
      const interval = this.getTimeInterval(timeRange);
      const startDate = new Date(Date.now() - interval);

      const query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
          SUM(amount::numeric) FILTER (WHERE status = 'succeeded') as total_volume,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time,
          json_object_agg(status, status_count) as by_status,
          json_object_agg(currency, currency_count) as by_currency
        FROM (
          SELECT 
            status,
            currency,
            amount,
            created_at,
            updated_at,
            COUNT(*) OVER (PARTITION BY status) as status_count,
            COUNT(*) OVER (PARTITION BY currency) as currency_count
          FROM payments
          WHERE created_at >= $1
        ) sub
        GROUP BY ()
      `;

      const result = await this.db.query(query, [startDate]);

      if (result.rows.length === 0) {
        return this.getEmptyPaymentMetrics();
      }

      const row = result.rows[0];
      const totalPayments = parseInt(row.total_payments) || 0;
      const successfulPayments = parseInt(row.successful_payments) || 0;

      return {
        totalPayments,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        averageProcessingTime: parseFloat(row.avg_processing_time) || 0,
        totalVolume: row.total_volume || '0',
        failureRate:
          totalPayments > 0
            ? ((parseInt(row.failed_payments) || 0) / totalPayments) * 100
            : 0,
        byStatus: row.by_status || {},
        byCurrency: row.by_currency || {},
      };
    } catch (error) {
      logger.error('Error fetching payment metrics:', error);
      return this.getEmptyPaymentMetrics();
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // In production, these would come from system monitoring tools
    const responseTimeStats = this.getMetricStats('response_time');

    return {
      cpuUsage: this.getMetricValue('cpu_usage') || 0,
      memoryUsage: this.getMetricValue('memory_usage') || 0,
      diskUsage: this.getMetricValue('disk_usage') || 0,
      networkIO: this.getMetricValue('network_io') || 0,
      databaseConnections: this.getMetricValue('db_connections') || 0,
      responseTimeP50: responseTimeStats?.median || 0,
      responseTimeP95: responseTimeStats?.p95 || 0,
      responseTimeP99: responseTimeStats?.p99 || 0,
    };
  }

  /**
   * Record HTTP request
   */
  recordRequest(responseTime: number, statusCode: number): void {
    this.recordMetric('response_time', responseTime);
    this.incrementCounter('requests_total');

    if (statusCode >= 400) {
      this.incrementCounter('requests_errors');
    }

    if (statusCode >= 500) {
      this.incrementCounter('requests_server_errors');
    }
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(hit: boolean): void {
    if (hit) {
      this.incrementCounter('cache_hits');
    } else {
      this.incrementCounter('cache_misses');
    }
  }

  /**
   * Record database query
   */
  recordDatabaseQuery(duration: number, success: boolean): void {
    this.recordMetric('db_query_time', duration);
    this.incrementCounter('db_queries_total');

    if (!success) {
      this.incrementCounter('db_queries_errors');
    }
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number): void {
    this.metrics.set(name, [value]);
  }

  /**
   * Increment counter
   */
  incrementCounter(name: string, amount: number = 1): void {
    const current = this.getMetricValue(name) || 0;
    this.setGauge(name, current + amount);
  }

  /**
   * Get metric value
   */
  private getMetricValue(name: string): number | null {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }
    return samples[samples.length - 1];
  }

  /**
   * Calculate rate per second
   */
  private calculateRate(metricName: string, windowSeconds: number): number {
    const samples = this.metrics.get(metricName);
    if (!samples || samples.length === 0) {
      return 0;
    }

    // Simple rate calculation based on recent samples
    const recentSamples = samples.slice(-windowSeconds);
    const sum = recentSamples.reduce((acc, val) => acc + val, 0);
    return sum / windowSeconds;
  }

  /**
   * Get time interval in milliseconds
   */
  private getTimeInterval(range: 'hour' | 'day' | 'week'): number {
    switch (range) {
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Get empty payment metrics
   */
  private getEmptyPaymentMetrics(): PaymentMetrics {
    return {
      totalPayments: 0,
      successRate: 0,
      averageProcessingTime: 0,
      totalVolume: '0',
      failureRate: 0,
      byStatus: {},
      byCurrency: {},
    };
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    this.metrics.forEach((samples, name) => {
      const stats = this.getMetricStats(name);
      if (stats) {
        lines.push(`# HELP ${name} Metric ${name}`);
        lines.push(`# TYPE ${name} gauge`);
        lines.push(`${name}_avg ${stats.avg}`);
        lines.push(`${name}_p95 ${stats.p95}`);
        lines.push(`${name}_p99 ${stats.p99}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Get health check metrics
   */
  async getHealthMetrics(): Promise<{
    healthy: boolean;
    checks: Record<string, { status: string; message?: string }>;
  }> {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Check database
    try {
      await this.db.query('SELECT 1');
      checks.database = { status: 'healthy' };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Check response time
    const responseTimeStats = this.getMetricStats('response_time');
    if (responseTimeStats && responseTimeStats.p95 > 1000) {
      checks.response_time = {
        status: 'degraded',
        message: 'High response time',
      };
    } else {
      checks.response_time = { status: 'healthy' };
    }

    // Check error rate
    const errorRate = this.getMetricValue('requests_errors') || 0;
    const totalRequests = this.getMetricValue('requests_total') || 1;
    const rate = (errorRate / totalRequests) * 100;

    if (rate > 5) {
      checks.error_rate = {
        status: 'degraded',
        message: `Error rate: ${rate.toFixed(2)}%`,
      };
    } else {
      checks.error_rate = { status: 'healthy' };
    }

    const healthy = Object.values(checks).every((check) => check.status === 'healthy');

    return { healthy, checks };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    logger.info('All metrics reset');
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {};

    this.metrics.forEach((samples, name) => {
      const stats = this.getMetricStats(name);
      if (stats) {
        summary[name] = {
          count: stats.count,
          avg: stats.avg.toFixed(2),
          p95: stats.p95.toFixed(2),
          p99: stats.p99.toFixed(2),
        };
      }
    });

    return summary;
  }
}
