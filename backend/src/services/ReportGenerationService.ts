/**
 * Report Generation Service
 * Generates various reports for payments and analytics
 */

import { Pool } from 'pg';
import logger from '../utils/logger';

export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  merchantId?: string;
  format: 'json' | 'csv' | 'pdf';
  groupBy?: 'day' | 'week' | 'month';
}

export interface PaymentReport {
  period: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: string;
  averageTransaction: string;
  currency: string;
}

export class ReportGenerationService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Generate payment summary report
   */
  async generatePaymentSummary(options: ReportOptions): Promise<string | object> {
    try {
      const { startDate, endDate, merchantId, format, groupBy = 'day' } = options;

      const query = `
        SELECT 
          DATE_TRUNC($1, created_at) as period,
          COUNT(*) as total_transactions,
          COUNT(*) FILTER (WHERE status = 'succeeded') as successful_transactions,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
          SUM(amount::numeric) as total_volume,
          AVG(amount::numeric) as average_transaction,
          currency
        FROM payments
        WHERE created_at >= $2 AND created_at <= $3
          ${merchantId ? 'AND merchant_id = $4' : ''}
        GROUP BY period, currency
        ORDER BY period DESC
      `;

      const params = merchantId
        ? [groupBy, startDate, endDate, merchantId]
        : [groupBy, startDate, endDate];

      const result = await this.db.query(query, params);

      const reportData: PaymentReport[] = result.rows.map((row) => ({
        period: row.period.toISOString(),
        totalTransactions: parseInt(row.total_transactions),
        successfulTransactions: parseInt(row.successful_transactions),
        failedTransactions: parseInt(row.failed_transactions),
        totalVolume: row.total_volume || '0',
        averageTransaction: row.average_transaction || '0',
        currency: row.currency || 'USD',
      }));

      if (format === 'csv') {
        return this.convertToCSV(reportData);
      } else if (format === 'pdf') {
        return this.generatePDF(reportData);
      }

      return {
        report: 'Payment Summary',
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate,
        },
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating payment summary report:', error);
      throw error;
    }
  }

  /**
   * Generate merchant performance report
   */
  async generateMerchantReport(merchantId: string, options: Omit<ReportOptions, 'merchantId'>): Promise<string | object> {
    try {
      const { startDate, endDate, format } = options;

      const query = `
        SELECT 
          m.merchant_id,
          m.merchant_name,
          COUNT(p.id) as total_transactions,
          COUNT(p.id) FILTER (WHERE p.status = 'succeeded') as successful_transactions,
          SUM(p.amount::numeric) FILTER (WHERE p.status = 'succeeded') as total_revenue,
          AVG(p.amount::numeric) as avg_transaction,
          MAX(p.created_at) as last_transaction,
          COUNT(DISTINCT DATE(p.created_at)) as active_days
        FROM merchants m
        LEFT JOIN payments p ON m.merchant_id = p.merchant_id
        WHERE m.merchant_id = $1
          AND p.created_at >= $2 AND p.created_at <= $3
        GROUP BY m.merchant_id, m.merchant_name
      `;

      const result = await this.db.query(query, [merchantId, startDate, endDate]);

      if (result.rows.length === 0) {
        throw new Error('Merchant not found or no data available');
      }

      const merchantData = result.rows[0];

      const reportData = {
        merchantId: merchantData.merchant_id,
        merchantName: merchantData.merchant_name,
        totalTransactions: parseInt(merchantData.total_transactions) || 0,
        successfulTransactions: parseInt(merchantData.successful_transactions) || 0,
        totalRevenue: merchantData.total_revenue || '0',
        avgTransaction: merchantData.avg_transaction || '0',
        lastTransaction: merchantData.last_transaction,
        activeDays: parseInt(merchantData.active_days) || 0,
        successRate:
          merchantData.total_transactions > 0
            ? ((merchantData.successful_transactions / merchantData.total_transactions) * 100).toFixed(2)
            : '0',
      };

      if (format === 'csv') {
        return this.convertToCSV([reportData]);
      } else if (format === 'pdf') {
        return this.generatePDF([reportData]);
      }

      return {
        report: 'Merchant Performance',
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate,
        },
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating merchant report:', error);
      throw error;
    }
  }

  /**
   * Generate transaction details report
   */
  async generateTransactionReport(options: ReportOptions): Promise<string | object> {
    try {
      const { startDate, endDate, merchantId, format } = options;

      const query = `
        SELECT 
          p.id,
          p.merchant_id,
          p.amount,
          p.currency,
          p.status,
          p.payment_method,
          p.transaction_hash,
          p.created_at,
          p.updated_at
        FROM payments p
        WHERE p.created_at >= $1 AND p.created_at <= $2
          ${merchantId ? 'AND p.merchant_id = $3' : ''}
        ORDER BY p.created_at DESC
      `;

      const params = merchantId ? [startDate, endDate, merchantId] : [startDate, endDate];

      const result = await this.db.query(query, params);

      const transactions = result.rows;

      if (format === 'csv') {
        return this.convertToCSV(transactions);
      } else if (format === 'pdf') {
        return this.generatePDF(transactions);
      }

      return {
        report: 'Transaction Details',
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate,
        },
        count: transactions.length,
        data: transactions,
      };
    } catch (error) {
      logger.error('Error generating transaction report:', error);
      throw error;
    }
  }

  /**
   * Generate revenue breakdown report
   */
  async generateRevenueBreakdown(options: ReportOptions): Promise<string | object> {
    try {
      const { startDate, endDate, merchantId, format } = options;

      const query = `
        SELECT 
          payment_method,
          currency,
          COUNT(*) as transaction_count,
          SUM(amount::numeric) as total_amount,
          AVG(amount::numeric) as avg_amount,
          MIN(amount::numeric) as min_amount,
          MAX(amount::numeric) as max_amount
        FROM payments
        WHERE status = 'succeeded'
          AND created_at >= $1 AND created_at <= $2
          ${merchantId ? 'AND merchant_id = $3' : ''}
        GROUP BY payment_method, currency
        ORDER BY total_amount DESC
      `;

      const params = merchantId ? [startDate, endDate, merchantId] : [startDate, endDate];

      const result = await this.db.query(query, params);

      const breakdown = result.rows.map((row) => ({
        paymentMethod: row.payment_method,
        currency: row.currency,
        transactionCount: parseInt(row.transaction_count),
        totalAmount: row.total_amount,
        avgAmount: row.avg_amount,
        minAmount: row.min_amount,
        maxAmount: row.max_amount,
      }));

      if (format === 'csv') {
        return this.convertToCSV(breakdown);
      } else if (format === 'pdf') {
        return this.generatePDF(breakdown);
      }

      return {
        report: 'Revenue Breakdown',
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate,
        },
        data: breakdown,
      };
    } catch (error) {
      logger.error('Error generating revenue breakdown report:', error);
      throw error;
    }
  }

  /**
   * Generate failure analysis report
   */
  async generateFailureAnalysis(options: ReportOptions): Promise<string | object> {
    try {
      const { startDate, endDate, merchantId, format } = options;

      const query = `
        SELECT 
          error_code,
          error_message,
          COUNT(*) as failure_count,
          AVG(amount::numeric) as avg_failed_amount,
          MIN(created_at) as first_occurrence,
          MAX(created_at) as last_occurrence
        FROM payments
        WHERE status = 'failed'
          AND created_at >= $1 AND created_at <= $2
          ${merchantId ? 'AND merchant_id = $3' : ''}
        GROUP BY error_code, error_message
        ORDER BY failure_count DESC
      `;

      const params = merchantId ? [startDate, endDate, merchantId] : [startDate, endDate];

      const result = await this.db.query(query, params);

      const failures = result.rows.map((row) => ({
        errorCode: row.error_code || 'UNKNOWN',
        errorMessage: row.error_message || 'Unknown error',
        failureCount: parseInt(row.failure_count),
        avgFailedAmount: row.avg_failed_amount || '0',
        firstOccurrence: row.first_occurrence,
        lastOccurrence: row.last_occurrence,
      }));

      if (format === 'csv') {
        return this.convertToCSV(failures);
      } else if (format === 'pdf') {
        return this.generatePDF(failures);
      }

      return {
        report: 'Failure Analysis',
        generatedAt: new Date(),
        period: {
          start: startDate,
          end: endDate,
        },
        data: failures,
      };
    } catch (error) {
      logger.error('Error generating failure analysis report:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: unknown[]): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0] as object);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Generate PDF (placeholder - would use actual PDF library)
   */
  private generatePDF(data: unknown[]): string {
    // Placeholder for PDF generation
    // In production, would use libraries like PDFKit or similar
    logger.info('PDF generation requested', { recordCount: data.length });
    return JSON.stringify({
      message: 'PDF generation not implemented',
      data,
    });
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(
    reportType: string,
    options: ReportOptions,
    schedule: string,
  ): Promise<string> {
    // Placeholder for report scheduling
    // Would integrate with a job queue like Bull or Agenda
    logger.info('Report scheduled', { reportType, schedule });
    return crypto.randomUUID();
  }

  /**
   * Get report history
   */
  async getReportHistory(merchantId?: string): Promise<unknown[]> {
    try {
      const query = `
        SELECT 
          id,
          report_type,
          format,
          generated_at,
          file_url
        FROM report_history
        ${merchantId ? 'WHERE merchant_id = $1' : ''}
        ORDER BY generated_at DESC
        LIMIT 50
      `;

      const params = merchantId ? [merchantId] : [];
      const result = await this.db.query(query, params);

      return result.rows;
    } catch (error) {
      logger.error('Error fetching report history:', error);
      return [];
    }
  }
}

