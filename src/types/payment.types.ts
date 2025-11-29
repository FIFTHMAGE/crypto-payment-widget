/**
 * Payment Types
 * Comprehensive type definitions for payment operations
 */

/**
 * Supported currencies
 */
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
export type CryptoCurrency = 'ETH' | 'BTC' | 'USDC' | 'USDT' | 'DAI' | 'MATIC';
export type Currency = FiatCurrency | CryptoCurrency;

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'confirming'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'expired';

/**
 * Token information
 */
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

/**
 * Payment request
 */
export interface PaymentRequest {
  id: string;
  merchantId: string;
  amount: string;
  currency: Currency;
  fiatAmount?: string;
  fiatCurrency?: FiatCurrency;
  recipient: string;
  description?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  callbackUrl?: string;
  redirectUrl?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment transaction
 */
export interface PaymentTransaction {
  id: string;
  requestId: string;
  transactionHash: string;
  blockNumber?: number;
  chainId: number;
  from: string;
  to: string;
  amount: string;
  token: Token;
  fee: string;
  status: PaymentStatus;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: Date;
  confirmedAt?: Date;
}

/**
 * Payment intent
 */
export interface PaymentIntent {
  id: string;
  amount: string;
  currency: Currency;
  token: Token;
  recipient: string;
  sender?: string;
  memo?: string;
  expiresAt: Date;
  qrCode?: string;
  paymentLink: string;
}

/**
 * Payment receipt
 */
export interface PaymentReceipt {
  id: string;
  transactionHash: string;
  timestamp: Date;
  from: string;
  to: string;
  amount: string;
  currency: Currency;
  fee: string;
  exchangeRate?: number;
  fiatValue?: string;
  blockExplorerUrl: string;
}

/**
 * Merchant configuration
 */
export interface MerchantConfig {
  id: string;
  name: string;
  walletAddress: string;
  acceptedCurrencies: CryptoCurrency[];
  defaultCurrency: CryptoCurrency;
  feePercent: number;
  webhookUrl?: string;
  apiKey: string;
  environment: 'test' | 'production';
}

/**
 * Exchange rate
 */
export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
  source: string;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  id: string;
  type: 'wallet' | 'card' | 'bank';
  label: string;
  token?: Token;
  chainId?: number;
  isDefault: boolean;
}

/**
 * Refund request
 */
export interface RefundRequest {
  id: string;
  paymentId: string;
  amount: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: Date;
  processedAt?: Date;
  transactionHash?: string;
}

/**
 * Payment error
 */
export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type PaymentErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_ADDRESS'
  | 'INVALID_AMOUNT'
  | 'NETWORK_ERROR'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_REJECTED'
  | 'PAYMENT_EXPIRED'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR';

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: PaymentTransaction | RefundRequest;
  timestamp: Date;
  signature: string;
}

export type WebhookEventType =
  | 'payment.created'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'refund.requested'
  | 'refund.processed';

/**
 * Payment statistics
 */
export interface PaymentStatistics {
  totalPayments: number;
  totalVolume: string;
  successRate: number;
  averagePayment: string;
  byCurrency: Record<Currency, { count: number; volume: string }>;
  byStatus: Record<PaymentStatus, number>;
}

