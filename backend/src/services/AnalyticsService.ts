/**
 * Analytics Service
 * Provides payment analytics, metrics, and reporting capabilities
 */

import { Pool } from 'pg';
import logger from '../utils/logger';

interface PaymentMetrics {
  totalVolume: string;
  totalCount: number;
  successRate: number;
  averageAmount: string;
  period: string;
}

interface TopToken {
  token: string;
  volume: string;
  count: number;
  percentage: number;
}

interface TimeSeriesData {
  timestamp: Date;
  volume: string;
  count: number;
}

interface AnalyticsSummary {
  metrics: PaymentMetrics;
  topTokens: TopToken[];
  timeSeries: TimeSeriesData[];
  statusBreakdown: Record<string, number>;
}

export class AnalyticsService {
  constructor(private db: Pool) {}

  /**
   * Get payment analytics for a specified time period
   */
  async getPaymentAnalytics(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
  ): Promise<AnalyticsSummary> {
    try {
      const [metrics, topTokens, timeSeries, statusBreakdown] = await Promise.all([
        this.getPaymentMetrics(startDate, endDate, merchantId),
        this.getTopTokens(startDate, endDate, merchantId),
        this.getTimeSeriesData(startDate, endDate, merchantId),
        this.getStatusBreakdown(startDate, endDate, merchantId),
      ]);

      return {
        metrics,
        topTokens,
        timeSeries,
        statusBreakdown,
      };
    } catch (error) {
      logger.error('Error getting payment analytics:', error);
      throw new Error('Failed to retrieve analytics data');
    }
  }

  /**
   * Get overall payment metrics
   */
  private async getPaymentMetrics(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
  ): Promise<PaymentMetrics> {
    const query = `
      SELECT 
        COALESCE(SUM(amount::numeric), 0) as total_volume,
        COUNT(*) as total_count,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
           NULLIF(COUNT(*), 0) * 100), 2
        ) as success_rate,
        COALESCE(AVG(amount::numeric), 0) as average_amount
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
        ${merchantId ? 'AND merchant_id = $3' : ''}
    `;

    const params = merchantId ? [startDate, endDate, merchantId] : [startDate, endDate];
    const result = await this.db.query(query, params);
    const row = result.rows[0];

    return {
      totalVolume: row.total_volume.toString(),
      totalCount: parseInt(row.total_count, 10),
      successRate: parseFloat(row.success_rate) || 0,
      averageAmount: row.average_amount.toString(),
      period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
    };
  }

  /**
   * Get top tokens by volume
   */
  private async getTopTokens(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
    limit: number = 10,
  ): Promise<TopToken[]> {
    const query = `
      WITH token_stats AS (
        SELECT 
          token,
          SUM(amount::numeric) as volume,
          COUNT(*) as count
        FROM payments
        WHERE created_at BETWEEN $1 AND $2
          ${merchantId ? 'AND merchant_id = $3' : ''}
          AND status = 'completed'
        GROUP BY token
      ),
      total_volume AS (
        SELECT SUM(volume) as total FROM token_stats
      )
      SELECT 
        ts.token,
        ts.volume::text,
        ts.count,
        ROUND((ts.volume / tv.total * 100)::numeric, 2) as percentage
      FROM token_stats ts, total_volume tv
      ORDER BY ts.volume DESC
      LIMIT $${merchantId ? 4 : 3}
    `;

    const params = merchantId ? [startDate, endDate, merchantId, limit] : [startDate, endDate, limit];
    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      token: row.token,
      volume: row.volume,
      count: parseInt(row.count, 10),
      percentage: parseFloat(row.percentage),
    }));
  }

  /**
   * Get time series data for charts
   */
  private async getTimeSeriesData(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
    interval: string = '1 day',
  ): Promise<TimeSeriesData[]> {
    const query = `
      SELECT 
        date_trunc($1, created_at) as timestamp,
        SUM(amount::numeric)::text as volume,
        COUNT(*) as count
      FROM payments
      WHERE created_at BETWEEN $2 AND $3
        ${merchantId ? 'AND merchant_id = $4' : ''}
        AND status = 'completed'
      GROUP BY date_trunc($1, created_at)
      ORDER BY timestamp ASC
    `;

    const params = merchantId
      ? [interval, startDate, endDate, merchantId]
      : [interval, startDate, endDate];
    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      timestamp: row.timestamp,
      volume: row.volume,
      count: parseInt(row.count, 10),
    }));
  }

  /**
   * Get payment status breakdown
   */
  private async getStatusBreakdown(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
  ): Promise<Record<string, number>> {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
        ${merchantId ? 'AND merchant_id = $3' : ''}
      GROUP BY status
    `;

    const params = merchantId ? [startDate, endDate, merchantId] : [startDate, endDate];
    const result = await this.db.query(query, params);

    return result.rows.reduce(
      (acc, row) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get merchant revenue analytics
   */
  async getMerchantRevenue(merchantId: string, startDate: Date, endDate: Date) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(amount::numeric)::text as revenue,
        SUM(platform_fee::numeric)::text as fees,
        COUNT(*) as transactions
      FROM payments
      WHERE merchant_id = $1
        AND created_at BETWEEN $2 AND $3
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await this.db.query(query, [merchantId, startDate, endDate]);
    return result.rows;
  }

  /**
   * Get real-time dashboard metrics
   */
  async getDashboardMetrics(merchantId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= $1) as today_count,
        SUM(amount::numeric) FILTER (WHERE created_at >= $1)::text as today_volume,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (
          WHERE status = 'completed' AND created_at >= $1
        ) as avg_completion_time
      FROM payments
      ${merchantId ? 'WHERE merchant_id = $2' : ''}
    `;

    const params = merchantId ? [today, merchantId] : [today];
    const result = await this.db.query(query, params);
    const row = result.rows[0];

    return {
      todayCount: parseInt(row.today_count, 10) || 0,
      todayVolume: row.today_volume || '0',
      pendingCount: parseInt(row.pending_count, 10) || 0,
      failedCount: parseInt(row.failed_count, 10) || 0,
      avgCompletionTime: parseFloat(row.avg_completion_time) || 0,
    };
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
    merchantId?: string,
    format: 'json' | 'csv' = 'json',
  ) {
    const analytics = await this.getPaymentAnalytics(startDate, endDate, merchantId);

    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }

    return analytics;
  }

  /**
   * Convert analytics data to CSV format
   */
  private convertToCSV(data: AnalyticsSummary): string {
    const lines: string[] = [];

    // Metrics section
    lines.push('Payment Metrics');
    lines.push('Total Volume,Total Count,Success Rate,Average Amount');
    lines.push(
      `${data.metrics.totalVolume},${data.metrics.totalCount},${data.metrics.successRate}%,${data.metrics.averageAmount}`,
    );
    lines.push('');

    // Top tokens section
    lines.push('Top Tokens');
    lines.push('Token,Volume,Count,Percentage');
    data.topTokens.forEach(token => {
      lines.push(`${token.token},${token.volume},${token.count},${token.percentage}%`);
    });
    lines.push('');

    // Time series section
    lines.push('Time Series');
    lines.push('Timestamp,Volume,Count');
    data.timeSeries.forEach(item => {
      lines.push(`${item.timestamp},${item.volume},${item.count}`);
    });

    return lines.join('\n');
  }
}

