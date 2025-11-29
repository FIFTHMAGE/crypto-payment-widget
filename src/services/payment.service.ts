/**
 * Payment Service
 * Handle payment processing, validation, and status tracking
 */

export interface PaymentRequest {
  id: string;
  amount: string;
  currency: string;
  tokenAddress?: string;
  recipient: string;
  sender?: string;
  memo?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PaymentTransaction {
  id: string;
  requestId: string;
  transactionHash: string;
  blockNumber?: number;
  status: TransactionStatus;
  amount: string;
  currency: string;
  fee: string;
  sender: string;
  recipient: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export type TransactionStatus = 
  | 'pending'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface PaymentConfig {
  supportedTokens: string[];
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  confirmations: number;
}

// Default configuration
const DEFAULT_CONFIG: PaymentConfig = {
  supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI'],
  minAmount: 0.001,
  maxAmount: 1000000,
  feePercent: 0.3,
  confirmations: 12,
};

// In-memory stores
const paymentRequests: Map<string, PaymentRequest> = new Map();
const transactions: Map<string, PaymentTransaction> = new Map();

class PaymentService {
  private config: PaymentConfig;

  constructor(config: Partial<PaymentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a payment request
   */
  createPaymentRequest(params: {
    amount: string;
    currency: string;
    recipient: string;
    memo?: string;
    metadata?: Record<string, unknown>;
    expiresIn?: number;
  }): PaymentRequest {
    // Validate amount
    const amount = parseFloat(params.amount);
    if (isNaN(amount) || amount < this.config.minAmount) {
      throw new Error(`Minimum amount is ${this.config.minAmount}`);
    }
    if (amount > this.config.maxAmount) {
      throw new Error(`Maximum amount is ${this.config.maxAmount}`);
    }

    // Validate currency
    if (!this.config.supportedTokens.includes(params.currency.toUpperCase())) {
      throw new Error(`Currency ${params.currency} not supported`);
    }

    // Validate recipient
    if (!params.recipient || !/^0x[a-fA-F0-9]{40}$/.test(params.recipient)) {
      throw new Error('Invalid recipient address');
    }

    const request: PaymentRequest = {
      id: this.generateId('pay'),
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      recipient: params.recipient,
      memo: params.memo,
      metadata: params.metadata,
      createdAt: new Date(),
      expiresAt: params.expiresIn 
        ? new Date(Date.now() + params.expiresIn * 1000) 
        : undefined,
    };

    paymentRequests.set(request.id, request);
    return request;
  }

  /**
   * Get payment request by ID
   */
  getPaymentRequest(id: string): PaymentRequest | null {
    return paymentRequests.get(id) || null;
  }

  /**
   * Check if payment request is expired
   */
  isExpired(request: PaymentRequest): boolean {
    if (!request.expiresAt) return false;
    return new Date() > request.expiresAt;
  }

  /**
   * Process a payment
   */
  async processPayment(
    requestId: string,
    sender: string,
    transactionHash: string
  ): Promise<PaymentTransaction> {
    const request = this.getPaymentRequest(requestId);
    if (!request) {
      throw new Error('Payment request not found');
    }

    if (this.isExpired(request)) {
      throw new Error('Payment request has expired');
    }

    const fee = (parseFloat(request.amount) * this.config.feePercent / 100).toFixed(6);

    const transaction: PaymentTransaction = {
      id: this.generateId('tx'),
      requestId,
      transactionHash,
      status: 'submitted',
      amount: request.amount,
      currency: request.currency,
      fee,
      sender,
      recipient: request.recipient,
      createdAt: new Date(),
    };

    transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    blockNumber?: number
  ): PaymentTransaction | null {
    const transaction = transactions.get(transactionId);
    if (!transaction) return null;

    transaction.status = status;
    if (blockNumber) transaction.blockNumber = blockNumber;
    if (status === 'confirmed') transaction.confirmedAt = new Date();

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): PaymentTransaction | null {
    return transactions.get(id) || null;
  }

  /**
   * Get transactions for a request
   */
  getTransactionsForRequest(requestId: string): PaymentTransaction[] {
    return Array.from(transactions.values())
      .filter(t => t.requestId === requestId);
  }

  /**
   * Calculate fee for amount
   */
  calculateFee(amount: number): number {
    return amount * this.config.feePercent / 100;
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens(): string[] {
    return [...this.config.supportedTokens];
  }

  /**
   * Check if token is supported
   */
  isTokenSupported(token: string): boolean {
    return this.config.supportedTokens.includes(token.toUpperCase());
  }

  /**
   * Get configuration
   */
  getConfig(): PaymentConfig {
    return { ...this.config };
  }

  /**
   * Generate payment link
   */
  generatePaymentLink(requestId: string, baseUrl: string): string {
    return `${baseUrl}/pay/${requestId}`;
  }

  /**
   * Verify payment completion
   */
  async verifyPayment(transactionHash: string): Promise<{
    verified: boolean;
    confirmations: number;
    status: string;
  }> {
    // In production, verify on blockchain
    // Mock implementation
    const mockConfirmations = Math.floor(Math.random() * 20);
    const verified = mockConfirmations >= this.config.confirmations;

    return {
      verified,
      confirmations: mockConfirmations,
      status: verified ? 'confirmed' : 'confirming',
    };
  }
}

// Export singleton
export const paymentService = new PaymentService();
export { PaymentService };
export default paymentService;
