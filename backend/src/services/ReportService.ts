/**
 * Report Service
 * Handles generation and export of payment reports
 */

import { Pool } from 'pg';
import logger from '../utils/logger';
import { Parser } from 'json2csv';

interface ReportFilters {
  merchantId?: string;
  startDate: Date;
  endDate: Date;
  status?: string[];
  token?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface PaymentReport {
  id: string;
  merchantId: string;
  amount: string;
  token: string;
  status: string;
  sender: string;
  recipient: string;
  transactionHash: string;
  createdAt: Date;
  updatedAt: Date;
  platformFee: string;
}

interface ReportSummary {
  totalPayments: number;
  totalVolume: string;
  totalFees: string;
  successRate: number;
  averageAmount: string;
  topTokens: Array<{ token: string; volume: string; count: number }>;
}

export type ReportFormat = 'json' | 'csv' | 'pdf';

export class ReportService {
  constructor(private db: Pool) {}

  /**
   * Generate payment report
   */
  async generatePaymentReport(
    filters: ReportFilters,
    format: ReportFormat = 'json',
  ): Promise<string | object> {
    try {
      logger.info('Generating payment report', { filters, format });

      const [payments, summary] = await Promise.all([
        this.getPaymentsForReport(filters),
        this.getReportSummary(filters),
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        filters,
        summary,
        payments,
      };

      // Format the report based on requested format
      switch (format) {
        case 'csv':
          return this.formatAsCSV(payments, summary);
        case 'pdf':
          return this.formatAsPDF(report);
        case 'json':
        default:
          return report;
      }
    } catch (error) {
      logger.error('Error generating payment report:', error);
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Get payments for report
   */
  private async getPaymentsForReport(filters: ReportFilters): Promise<PaymentReport[]> {
    let query = `
      SELECT 
        id,
        merchant_id,
        amount,
        token,
        status,
        sender_address as sender,
        recipient_address as recipient,
        transaction_hash,
        created_at,
        updated_at,
        platform_fee
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
    `;

    const params: any[] = [filters.startDate, filters.endDate];
    let paramIndex = 3;

    if (filters.merchantId) {
      query += ` AND merchant_id = $${paramIndex}`;
      params.push(filters.merchantId);
      paramIndex++;
    }

    if (filters.status && filters.status.length > 0) {
      query += ` AND status = ANY($${paramIndex})`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.token) {
      query += ` AND token = $${paramIndex}`;
      params.push(filters.token);
      paramIndex++;
    }

    if (filters.minAmount) {
      query += ` AND amount::numeric >= $${paramIndex}::numeric`;
      params.push(filters.minAmount);
      paramIndex++;
    }

    if (filters.maxAmount) {
      query += ` AND amount::numeric <= $${paramIndex}::numeric`;
      params.push(filters.maxAmount);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get report summary
   */
  private async getReportSummary(filters: ReportFilters): Promise<ReportSummary> {
    // Get overall metrics
    let metricsQuery = `
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount::numeric), 0) as total_volume,
        COALESCE(SUM(platform_fee::numeric), 0) as total_fees,
        COALESCE(AVG(amount::numeric), 0) as average_amount,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
           NULLIF(COUNT(*), 0) * 100), 2
        ) as success_rate
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
    `;

    const metricsParams: any[] = [filters.startDate, filters.endDate];
    let paramIndex = 3;

    if (filters.merchantId) {
      metricsQuery += ` AND merchant_id = $${paramIndex}`;
      metricsParams.push(filters.merchantId);
      paramIndex++;
    }

    const metricsResult = await this.db.query(metricsQuery, metricsParams);
    const metrics = metricsResult.rows[0];

    // Get top tokens
    let tokensQuery = `
      SELECT 
        token,
        SUM(amount::numeric)::text as volume,
        COUNT(*) as count
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
        AND status = 'completed'
    `;

    const tokensParams: any[] = [filters.startDate, filters.endDate];

    if (filters.merchantId) {
      tokensQuery += ` AND merchant_id = $3`;
      tokensParams.push(filters.merchantId);
    }

    tokensQuery += ` GROUP BY token ORDER BY SUM(amount::numeric) DESC LIMIT 5`;

    const tokensResult = await this.db.query(tokensQuery, tokensParams);

    return {
      totalPayments: parseInt(metrics.total_payments, 10),
      totalVolume: metrics.total_volume.toString(),
      totalFees: metrics.total_fees.toString(),
      successRate: parseFloat(metrics.success_rate) || 0,
      averageAmount: metrics.average_amount.toString(),
      topTokens: tokensResult.rows.map(row => ({
        token: row.token,
        volume: row.volume,
        count: parseInt(row.count, 10),
      })),
    };
  }

  /**
   * Format report as CSV
   */
  private formatAsCSV(payments: PaymentReport[], summary: ReportSummary): string {
    const lines: string[] = [];

    // Summary section
    lines.push('Payment Report Summary');
    lines.push('');
    lines.push(`Total Payments,${summary.totalPayments}`);
    lines.push(`Total Volume,${summary.totalVolume}`);
    lines.push(`Total Fees,${summary.totalFees}`);
    lines.push(`Success Rate,${summary.successRate}%`);
    lines.push(`Average Amount,${summary.averageAmount}`);
    lines.push('');

    // Top tokens section
    lines.push('Top Tokens');
    lines.push('Token,Volume,Count');
    summary.topTokens.forEach(token => {
      lines.push(`${token.token},${token.volume},${token.count}`);
    });
    lines.push('');

    // Payments section
    lines.push('Payment Details');

    const fields = [
      'id',
      'merchantId',
      'amount',
      'token',
      'status',
      'sender',
      'recipient',
      'transactionHash',
      'createdAt',
      'platformFee',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(payments);

    lines.push(csv);

    return lines.join('\n');
  }

  /**
   * Format report as PDF (placeholder - would use a PDF library)
   */
  private formatAsPDF(report: any): string {
    // In a real implementation, this would use a PDF generation library
    // like pdfkit or puppeteer
    logger.info('PDF generation requested - returning JSON for now');
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate merchant performance report
   */
  async generateMerchantReport(merchantId: string, startDate: Date, endDate: Date) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        SUM(amount::numeric)::text as volume,
        SUM(platform_fee::numeric)::text as fees,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time
      FROM payments
      WHERE merchant_id = $1
        AND created_at BETWEEN $2 AND $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await this.db.query(query, [merchantId, startDate, endDate]);

    return {
      merchantId,
      period: {
        start: startDate,
        end: endDate,
      },
      dailyStats: result.rows.map(row => ({
        date: row.date,
        transactions: parseInt(row.transactions, 10),
        volume: row.volume,
        fees: row.fees,
        completed: parseInt(row.completed, 10),
        failed: parseInt(row.failed, 10),
        avgProcessingTime: parseFloat(row.avg_processing_time) || 0,
      })),
    };
  }

  /**
   * Generate token usage report
   */
  async generateTokenReport(startDate: Date, endDate: Date) {
    const query = `
      SELECT 
        token,
        COUNT(*) as transaction_count,
        SUM(amount::numeric)::text as total_volume,
        AVG(amount::numeric)::text as avg_amount,
        COUNT(DISTINCT merchant_id) as merchant_count,
        COUNT(*) FILTER (WHERE status = 'completed') as successful_txns
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY token
      ORDER BY SUM(amount::numeric) DESC
    `;

    const result = await this.db.query(query, [startDate, endDate]);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      tokens: result.rows.map(row => ({
        token: row.token,
        transactionCount: parseInt(row.transaction_count, 10),
        totalVolume: row.total_volume,
        avgAmount: row.avg_amount,
        merchantCount: parseInt(row.merchant_count, 10),
        successfulTxns: parseInt(row.successful_txns, 10),
        successRate: (
          (parseInt(row.successful_txns, 10) / parseInt(row.transaction_count, 10)) *
          100
        ).toFixed(2),
      })),
    };
  }

  /**
   * Generate hourly transaction report
   */
  async generateHourlyReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as transactions,
        SUM(amount::numeric)::text as volume,
        AVG(amount::numeric)::text as avg_amount
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `;

    const result = await this.db.query(query, [startOfDay, endOfDay]);

    // Fill in missing hours with zero values
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const data = result.rows.find(row => parseInt(row.hour, 10) === hour);
      return {
        hour,
        transactions: data ? parseInt(data.transactions, 10) : 0,
        volume: data ? data.volume : '0',
        avgAmount: data ? data.avg_amount : '0',
      };
    });

    return {
      date: date.toISOString().split('T')[0],
      hourlyData,
    };
  }

  /**
   * Schedule automated report
   */
  async scheduleReport(
    reportType: string,
    filters: ReportFilters,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
  ) {
    const query = `
      INSERT INTO scheduled_reports (
        report_type,
        filters,
        schedule,
        recipients,
        next_run,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const nextRun = this.calculateNextRun(schedule);

    const result = await this.db.query(query, [
      reportType,
      JSON.stringify(filters),
      schedule,
      recipients,
      nextRun,
    ]);

    return result.rows[0].id;
  }

  /**
   * Calculate next run time for scheduled report
   */
  private calculateNextRun(schedule: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();

    switch (schedule) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        now.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        break;
    }

    return now;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(merchantId?: string) {
    let query = `
      SELECT *
      FROM scheduled_reports
      WHERE active = true
    `;

    const params: any[] = [];

    if (merchantId) {
      query += ` AND filters->>'merchantId' = $1`;
      params.push(merchantId);
    }

    query += ' ORDER BY next_run ASC';

    const result = await this.db.query(query, params);
    return result.rows;
  }
}

