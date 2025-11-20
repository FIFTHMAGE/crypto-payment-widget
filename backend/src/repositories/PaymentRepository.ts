/**
 * PaymentRepository - Database operations for payments
 * @module repositories
 */

import { EnhancedPayment, PaymentStatus, BlockchainNetwork } from '../models/Enhanced Payment.model';
import { Logger } from '../utils/logger';

export interface PaymentFilters {
  merchantId?: string;
  status?: PaymentStatus;
  network?: BlockchainNetwork;
  payerAddress?: string;
  payeeAddress?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: keyof EnhancedPayment;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaymentRepository {
  private logger: Logger;
  private payments: Map<string, EnhancedPayment> = new Map();

  constructor() {
    this.logger = new Logger('PaymentRepository');
    this.logger.info('PaymentRepository initialized');
  }

  /**
   * Create a new payment
   */
  async create(payment: EnhancedPayment): Promise<EnhancedPayment> {
    this.payments.set(payment.id, payment);
    this.logger.info(`Payment created: ${payment.id}`);
    return payment;
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<EnhancedPayment | null> {
    return this.payments.get(id) || null;
  }

  /**
   * Update payment
   */
  async update(id: string, updates: Partial<EnhancedPayment>): Promise<EnhancedPayment | null> {
    const payment = this.payments.get(id);
    if (!payment) {
      return null;
    }

    const updatedPayment: EnhancedPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.payments.set(id, updatedPayment);
    this.logger.info(`Payment updated: ${id}`);
    return updatedPayment;
  }

  /**
   * Delete payment
   */
  async delete(id: string): Promise<boolean> {
    const deleted = this.payments.delete(id);
    if (deleted) {
      this.logger.info(`Payment deleted: ${id}`);
    }
    return deleted;
  }

  /**
   * Find payments with filters and pagination
   */
  async findMany(
    filters: PaymentFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<EnhancedPayment>> {
    let filtered = Array.from(this.payments.values());

    // Apply filters
    if (filters.merchantId) {
      filtered = filtered.filter((p) => p.merchantId === filters.merchantId);
    }
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }
    if (filters.network) {
      filtered = filtered.filter((p) => p.network === filters.network);
    }
    if (filters.payerAddress) {
      filtered = filtered.filter((p) => p.payerAddress === filters.payerAddress);
    }
    if (filters.payeeAddress) {
      filtered = filtered.filter((p) => p.payeeAddress === filters.payeeAddress);
    }
    if (filters.fromDate) {
      filtered = filtered.filter((p) => new Date(p.createdAt) >= filters.fromDate!);
    }
    if (filters.toDate) {
      filtered = filtered.filter((p) => new Date(p.createdAt) <= filters.toDate!);
    }

    // Sort
    if (pagination.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[pagination.sortBy!];
        const bVal = b[pagination.sortBy!];
        const order = pagination.sortOrder === 'desc' ? -1 : 1;
        return aVal < bVal ? -order : aVal > bVal ? order : 0;
      });
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const data = filtered.slice(start, start + pagination.limit);

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  /**
   * Count payments by status
   */
  async countByStatus(merchantId?: string): Promise<Record<PaymentStatus, number>> {
    let payments = Array.from(this.payments.values());
    
    if (merchantId) {
      payments = payments.filter((p) => p.merchantId === merchantId);
    }

    const counts: Record<PaymentStatus, number> = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.AWAITING_CONFIRMATION]: 0,
      [PaymentStatus.PROCESSING]: 0,
      [PaymentStatus.COMPLETED]: 0,
      [PaymentStatus.FAILED]: 0,
      [PaymentStatus.CANCELLED]: 0,
      [PaymentStatus.REFUNDED]: 0,
      [PaymentStatus.DISPUTED]: 0,
    };

    payments.forEach((payment) => {
      counts[payment.status]++;
    });

    return counts;
  }

  /**
   * Get payment statistics
   */
  async getStatistics(merchantId?: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
  }> {
    let payments = Array.from(this.payments.values());
    
    if (merchantId) {
      payments = payments.filter((p) => p.merchantId === merchantId);
    }

    const totalPayments = payments.length;
    const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED);
    const totalAmount = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
    const successRate = totalPayments > 0 ? (completedPayments.length / totalPayments) * 100 : 0;

    return {
      totalPayments,
      totalAmount,
      averageAmount,
      successRate,
    };
  }

  /**
   * Find payments by transaction hash
   */
  async findByTransactionHash(txHash: string): Promise<EnhancedPayment | null> {
    for (const payment of this.payments.values()) {
      if (payment.transactions.some((tx) => tx.txHash === txHash)) {
        return payment;
      }
    }
    return null;
  }

  /**
   * Update payment status
   */
  async updateStatus(id: string, status: PaymentStatus): Promise<EnhancedPayment | null> {
    return this.update(id, { status });
  }
}
