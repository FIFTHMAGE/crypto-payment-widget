/**
 * PaymentRepository - Database operations for payments
 * @module database
 */

export interface Payment {
  id: string;
  merchantId: string;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  currency: string;
  tokenAddress?: string;
  network: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  transactionHash?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  feeAmount?: string;
  netAmount?: string;
}

export interface CreatePaymentData {
  merchantId: string;
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  currency: string;
  tokenAddress?: string;
  network: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface UpdatePaymentData {
  status?: Payment['status'];
  transactionHash?: string;
  metadata?: Record<string, any>;
  feeAmount?: string;
  netAmount?: string;
}

export interface PaymentFilter {
  merchantId?: string;
  payerAddress?: string;
  payeeAddress?: string;
  status?: Payment['status'];
  network?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: keyof Payment;
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
  private payments: Map<string, Payment> = new Map();

  /**
   * Create a new payment
   */
  async create(data: CreatePaymentData): Promise<Payment> {
    const payment: Payment = {
      id: this.generateId(),
      ...data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.payments.set(payment.id, payment);
    return payment;
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  /**
   * Find payment by transaction hash
   */
  async findByTransactionHash(txHash: string): Promise<Payment | null> {
    for (const payment of this.payments.values()) {
      if (payment.transactionHash === txHash) {
        return payment;
      }
    }
    return null;
  }

  /**
   * Find payments with filters
   */
  async find(
    filter: PaymentFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Payment>> {
    let filtered = Array.from(this.payments.values());

    // Apply filters
    if (filter.merchantId) {
      filtered = filtered.filter((p) => p.merchantId === filter.merchantId);
    }
    if (filter.payerAddress) {
      filtered = filtered.filter((p) => p.payerAddress === filter.payerAddress);
    }
    if (filter.payeeAddress) {
      filtered = filtered.filter((p) => p.payeeAddress === filter.payeeAddress);
    }
    if (filter.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }
    if (filter.network) {
      filtered = filtered.filter((p) => p.network === filter.network);
    }
    if (filter.startDate) {
      filtered = filtered.filter((p) => p.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter((p) => p.createdAt <= filter.endDate!);
    }

    // Apply sorting
    if (pagination?.sortBy) {
      const sortBy = pagination.sortBy;
      const sortOrder = pagination.sortOrder || 'desc';

      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal instanceof Date && bVal instanceof Date) {
          return sortOrder === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return 0;
      });
    } else {
      // Default sort by createdAt desc
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  /**
   * Update payment
   */
  async update(id: string, data: UpdatePaymentData): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updated: Payment = {
      ...payment,
      ...data,
      updatedAt: new Date(),
    };

    this.payments.set(id, updated);
    return updated;
  }

  /**
   * Delete payment
   */
  async delete(id: string): Promise<boolean> {
    return this.payments.delete(id);
  }

  /**
   * Count payments
   */
  async count(filter?: PaymentFilter): Promise<number> {
    if (!filter) {
      return this.payments.size;
    }

    const result = await this.find(filter);
    return result.total;
  }

  /**
   * Get payment statistics
   */
  async getStatistics(filter?: PaymentFilter): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    failedPayments: number;
    averageAmount: number;
    statusBreakdown: Record<Payment['status'], number>;
  }> {
    const result = await this.find(filter || {});
    const payments = result.data;

    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const completedPayments = payments.filter((p) => p.status === 'completed').length;
    const failedPayments = payments.filter((p) => p.status === 'failed').length;

    const statusBreakdown: Record<Payment['status'], number> = {
      pending: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
      disputed: 0,
    };

    for (const payment of payments) {
      statusBreakdown[payment.status]++;
    }

    return {
      totalPayments: payments.length,
      totalAmount,
      completedPayments,
      failedPayments,
      averageAmount: payments.length > 0 ? totalAmount / payments.length : 0,
      statusBreakdown,
    };
  }

  /**
   * Get recent payments
   */
  async getRecent(limit: number = 10, merchantId?: string): Promise<Payment[]> {
    const filter: PaymentFilter = merchantId ? { merchantId } : {};
    const result = await this.find(filter, { page: 1, limit, sortBy: 'createdAt', sortOrder: 'desc' });
    return result.data;
  }

  /**
   * Get expired pending payments
   */
  async getExpiredPending(): Promise<Payment[]> {
    const now = new Date();
    return Array.from(this.payments.values()).filter(
      (p) => p.status === 'pending' && p.expiresAt && p.expiresAt < now
    );
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(ids: string[], status: Payment['status']): Promise<number> {
    let updated = 0;
    for (const id of ids) {
      const result = await this.update(id, { status });
      if (result) updated++;
    }
    return updated;
  }

  /**
   * Get payment volume by period
   */
  async getVolumeByPeriod(
    period: 'day' | 'week' | 'month',
    filter?: PaymentFilter
  ): Promise<Array<{ date: string; volume: number; count: number }>> {
    const result = await this.find(filter || {});
    const payments = result.data;

    const groupBy: Record<string, { volume: number; count: number }> = {};

    for (const payment of payments) {
      if (payment.status !== 'completed') continue;

      const date = this.getDateKey(payment.createdAt, period);
      if (!groupBy[date]) {
        groupBy[date] = { volume: 0, count: 0 };
      }

      groupBy[date].volume += parseFloat(payment.amount);
      groupBy[date].count++;
    }

    return Object.entries(groupBy)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Search payments
   */
  async search(
    query: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Payment>> {
    const lowerQuery = query.toLowerCase();

    let filtered = Array.from(this.payments.values()).filter(
      (p) =>
        p.id.toLowerCase().includes(lowerQuery) ||
        p.payerAddress.toLowerCase().includes(lowerQuery) ||
        p.payeeAddress.toLowerCase().includes(lowerQuery) ||
        p.transactionHash?.toLowerCase().includes(lowerQuery) ||
        p.merchantId.toLowerCase().includes(lowerQuery)
    );

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  /**
   * Generate payment ID
   */
  private generateId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get date key for grouping
   */
  private getDateKey(date: Date, period: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (period) {
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week':
        const weekNum = this.getWeekNumber(date);
        return `${year}-W${String(weekNum).padStart(2, '0')}`;
      case 'month':
        return `${year}-${month}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Get week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Clear all payments (for testing)
   */
  async clear(): Promise<void> {
    this.payments.clear();
  }
}

export const paymentRepository = new PaymentRepository();

