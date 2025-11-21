/**
 * Metrics Service
 * System performance and business metrics tracking
 */

import logger from '../utils/logger';
import { CacheService } from './CacheService';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    percentage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number; // ms
  };
  database: {
    connections: number;
    activeQueries: number;
    slowQueries: number;
  };
}

export interface BusinessMetrics {
  timestamp: Date;
  payments: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalVolume: number;
    avgValue: number;
  };
  revenue: {
    total: number;
    fees: number;
    avgPerTransaction: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
}

interface MetricDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

interface MetricsSummary {
  current: number;
  min: number;
  max: number;
  avg: number;
  trend: 'up' | 'down' | 'stable';
}

export class MetricsService {
  private static instance: MetricsService;
  private cacheService: CacheService;
  private metricsHistory: Map<string, MetricDataPoint[]>;
  private readonly maxHistorySize = 1000;
  private readonly historyRetentionHours = 24;

  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.metricsHistory = new Map();
    logger.info('MetricsService initialized.');

    // Start periodic metrics collection
    this.startPeriodicCollection();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Record a custom metric data point
   */
  public recordMetric(name: string, value: number, label?: string): void {
    try {
      const dataPoint: MetricDataPoint = {
        timestamp: new Date(),
        value,
        label,
      };

      if (!this.metricsHistory.has(name)) {
        this.metricsHistory.set(name, []);
      }

      const history = this.metricsHistory.get(name)!;
      history.push(dataPoint);

      // Trim history if too large
      if (history.length > this.maxHistorySize) {
        history.shift();
      }

      // Clean old data
      this.cleanOldMetrics(name);

      logger.debug(`Recorded metric: ${name} = ${value}`);
    } catch (error) {
      logger.error(`Error recording metric ${name}:`, error);
    }
  }

  /**
   * Get metric history
   */
  public getMetricHistory(name: string, hours: number = 1): MetricDataPoint[] {
    const history = this.metricsHistory.get(name) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return history.filter((dp) => dp.timestamp >= cutoffTime);
  }

  /**
   * Get metric summary statistics
   */
  public getMetricSummary(name: string, hours: number = 1): MetricsSummary | null {
    const history = this.getMetricHistory(name, hours);

    if (history.length === 0) {
      return null;
    }

    const values = history.map((dp) => dp.value);
    const current = values[values.length - 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (history.length >= 2) {
      const recentAvg = values.slice(-5).reduce((sum, v) => sum + v, 0) / Math.min(5, values.length);
      const olderAvg = values.slice(0, -5).reduce((sum, v) => sum + v, 0) / Math.max(1, values.length - 5);

      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';
    }

    return { current, min, max, avg, trend };
  }

  /**
   * Collect system metrics
   */
  public async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: await this.getCPUUsage(),
          cores: require('os').cpus().length,
        },
        memory: {
          used: process.memoryUsage().heapUsed,
          total: require('os').totalmem(),
          percentage: (process.memoryUsage().heapUsed / require('os').totalmem()) * 100,
        },
        requests: {
          total: this.getMetricValue('requests_total') || 0,
          successful: this.getMetricValue('requests_successful') || 0,
          failed: this.getMetricValue('requests_failed') || 0,
          avgResponseTime: this.getMetricValue('response_time_avg') || 0,
        },
        database: {
          connections: this.getMetricValue('db_connections') || 0,
          activeQueries: this.getMetricValue('db_active_queries') || 0,
          slowQueries: this.getMetricValue('db_slow_queries') || 0,
        },
      };

      // Record key metrics
      this.recordMetric('cpu_usage', metrics.cpu.usage);
      this.recordMetric('memory_usage', metrics.memory.percentage);

      return metrics;
    } catch (error) {
      logger.error('Error collecting system metrics:', error);
      throw error;
    }
  }

  /**
   * Collect business metrics
   */
  public async collectBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const metrics: BusinessMetrics = {
        timestamp: new Date(),
        payments: {
          total: this.getMetricValue('payments_total') || 0,
          successful: this.getMetricValue('payments_successful') || 0,
          failed: this.getMetricValue('payments_failed') || 0,
          pending: this.getMetricValue('payments_pending') || 0,
          totalVolume: this.getMetricValue('payments_volume') || 0,
          avgValue: this.getMetricValue('payments_avg_value') || 0,
        },
        revenue: {
          total: this.getMetricValue('revenue_total') || 0,
          fees: this.getMetricValue('revenue_fees') || 0,
          avgPerTransaction: this.getMetricValue('revenue_per_transaction') || 0,
        },
        users: {
          total: this.getMetricValue('users_total') || 0,
          active: this.getMetricValue('users_active') || 0,
          new: this.getMetricValue('users_new') || 0,
        },
      };

      return metrics;
    } catch (error) {
      logger.error('Error collecting business metrics:', error);
      throw error;
    }
  }

  /**
   * Increment a counter metric
   */
  public incrementCounter(name: string, value: number = 1): void {
    const currentValue = this.getMetricValue(name) || 0;
    this.recordMetric(name, currentValue + value);
  }

  /**
   * Set a gauge metric
   */
  public setGauge(name: string, value: number): void {
    this.recordMetric(name, value);
  }

  /**
   * Record a histogram value (e.g., response time)
   */
  public recordHistogram(name: string, value: number): void {
    this.recordMetric(name, value);

    // Also calculate and store running average
    const history = this.getMetricHistory(name, 1);
    const avg = history.reduce((sum, dp) => sum + dp.value, 0) / history.length;
    this.recordMetric(`${name}_avg`, avg);
  }

  /**
   * Get current value of a metric
   */
  private getMetricValue(name: string): number | null {
    const history = this.metricsHistory.get(name);
    if (!history || history.length === 0) return null;

    return history[history.length - 1].value;
  }

  /**
   * Clean old metrics data
   */
  private cleanOldMetrics(name: string): void {
    const history = this.metricsHistory.get(name);
    if (!history) return;

    const cutoffTime = new Date(Date.now() - this.historyRetentionHours * 60 * 60 * 1000);
    const filtered = history.filter((dp) => dp.timestamp >= cutoffTime);

    this.metricsHistory.set(name, filtered);
  }

  /**
   * Get CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();

      setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        const elapsedUsage = process.cpuUsage(startUsage);
        const totalUsage = (elapsedUsage.user + elapsedUsage.system) / 1000; // Convert to ms
        const percentage = (totalUsage / elapsedTime) * 100;

        resolve(Math.min(percentage, 100));
      }, 100);
    });
  }

  /**
   * Start periodic metrics collection
   */
  private startPeriodicCollection(): void {
    // Collect system metrics every minute
    setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        logger.error('Error in periodic metrics collection:', error);
      }
    }, 60000);

    logger.info('Started periodic metrics collection');
  }

  /**
   * Get all metrics for monitoring dashboard
   */
  public async getAllMetrics(): Promise<{
    system: SystemMetrics;
    business: BusinessMetrics;
  }> {
    const [system, business] = await Promise.all([
      this.collectSystemMetrics(),
      this.collectBusinessMetrics(),
    ]);

    return { system, business };
  }

  /**
   * Export metrics in Prometheus format
   */
  public exportPrometheusMetrics(): string {
    const lines: string[] = [];

    this.metricsHistory.forEach((history, name) => {
      const latest = history[history.length - 1];
      if (latest) {
        lines.push(`# TYPE ${name} gauge`);
        lines.push(`${name} ${latest.value} ${latest.timestamp.getTime()}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Get health status based on metrics
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    details: Record<string, any>;
  } {
    const cpuUsage = this.getMetricValue('cpu_usage') || 0;
    const memoryUsage = this.getMetricValue('memory_usage') || 0;
    const failedRequests = this.getMetricValue('requests_failed') || 0;
    const totalRequests = this.getMetricValue('requests_total') || 1;

    const errorRate = (failedRequests / totalRequests) * 100;

    const checks = {
      cpu: cpuUsage < 80,
      memory: memoryUsage < 80,
      errorRate: errorRate < 5,
    };

    let status: 'healthy' | 'degraded' | 'unhealthy';
    const healthyChecks = Object.values(checks).filter(Boolean).length;

    if (healthyChecks === 3) status = 'healthy';
    else if (healthyChecks >= 2) status = 'degraded';
    else status = 'unhealthy';

    return {
      status,
      checks,
      details: {
        cpuUsage: `${cpuUsage.toFixed(2)}%`,
        memoryUsage: `${memoryUsage.toFixed(2)}%`,
        errorRate: `${errorRate.toFixed(2)}%`,
      },
    };
  }
}
