import { logger } from '../utils/logger';

/**
 * Transaction Service
 * Handles transaction CRUD operations
 */

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export interface TransactionData {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  token?: string;
  chainId?: number;
  blockNumber?: number;
  gasPrice?: string;
  gasUsed?: string;
  metadata?: Record<string, unknown>;
}

export interface Transaction extends TransactionData {
  id: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  verifiedAt?: string;
}

export interface TransactionQuery {
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
  from?: string;
  to?: string;
  token?: string;
  chainId?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TransactionStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  cancelled: number;
  totalVolume: number;
}

class TransactionService {
  private transactions: Transaction[] = [];
  private nextId = 1;

  /**
   * Create a new transaction
   */
  async create(transactionData: TransactionData): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.nextId++,
      ...transactionData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.transactions.push(transaction);
    logger.info('Transaction created', { id: transaction.id, txHash: transaction.txHash });

    return transaction;
  }

  /**
   * Find all transactions with pagination and filters
   */
  async findAll(query: TransactionQuery = {}): Promise<PaginatedResult<Transaction>> {
    const { limit = 50, offset = 0, status, from, to, token, chainId } = query;

    let filtered = [...this.transactions];

    // Apply filters
    if (status) {
      filtered = filtered.filter((tx) => tx.status === status);
    }
    if (from) {
      filtered = filtered.filter((tx) => tx.from.toLowerCase() === from.toLowerCase());
    }
    if (to) {
      filtered = filtered.filter((tx) => tx.to.toLowerCase() === to.toLowerCase());
    }
    if (token) {
      filtered = filtered.filter((tx) => tx.token === token);
    }
    if (chainId) {
      filtered = filtered.filter((tx) => tx.chainId === chainId);
    }

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit).reverse();

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Find a transaction by hash
   */
  async findByHash(txHash: string): Promise<Transaction | null> {
    const transaction = this.transactions.find((tx) => tx.txHash === txHash);
    return transaction || null;
  }

  /**
   * Find a transaction by ID
   */
  async findById(id: number): Promise<Transaction | null> {
    const transaction = this.transactions.find((tx) => tx.id === id);
    return transaction || null;
  }

  /**
   * Update a transaction
   */
  async update(
    txHash: string,
    updates: Partial<Omit<Transaction, 'id' | 'txHash' | 'createdAt'>>
  ): Promise<Transaction | null> {
    const index = this.transactions.findIndex((tx) => tx.txHash === txHash);

    if (index === -1) {
      return null;
    }

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    logger.info('Transaction updated', { txHash });
    return this.transactions[index];
  }

  /**
   * Delete a transaction
   */
  async delete(txHash: string): Promise<boolean> {
    const index = this.transactions.findIndex((tx) => tx.txHash === txHash);

    if (index === -1) {
      return false;
    }

    this.transactions.splice(index, 1);
    logger.info('Transaction deleted', { txHash });
    return true;
  }

  /**
   * Get transaction statistics
   */
  async getStats(): Promise<TransactionStats> {
    const totalVolume = this.transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || '0'),
      0
    );

    return {
      total: this.transactions.length,
      pending: this.transactions.filter((tx) => tx.status === 'pending').length,
      confirmed: this.transactions.filter((tx) => tx.status === 'confirmed').length,
      failed: this.transactions.filter((tx) => tx.status === 'failed').length,
      cancelled: this.transactions.filter((tx) => tx.status === 'cancelled').length,
      totalVolume,
    };
  }

  /**
   * Confirm a transaction
   */
  async confirm(txHash: string, blockNumber?: number): Promise<Transaction | null> {
    return this.update(txHash, {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      blockNumber,
    });
  }

  /**
   * Fail a transaction
   */
  async fail(txHash: string, reason?: string): Promise<Transaction | null> {
    return this.update(txHash, {
      status: 'failed',
      metadata: { failureReason: reason },
    });
  }

  /**
   * Get transactions by address
   */
  async findByAddress(address: string): Promise<Transaction[]> {
    const normalizedAddress = address.toLowerCase();
    return this.transactions.filter(
      (tx) =>
        tx.from.toLowerCase() === normalizedAddress ||
        tx.to.toLowerCase() === normalizedAddress
    );
  }

  /**
   * Clear all transactions (for testing)
   */
  async clear(): Promise<void> {
    this.transactions = [];
    this.nextId = 1;
    logger.info('All transactions cleared');
  }
}

export const transactionService = new TransactionService();

export default transactionService;

