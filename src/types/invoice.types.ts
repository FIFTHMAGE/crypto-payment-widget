/**
 * Invoice Types
 * Type definitions for invoice generation and management
 */

/**
 * Invoice status
 */
export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

/**
 * Invoice item
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  total: number;
}

/**
 * Invoice
 */
export interface Invoice {
  id: string;
  number: string;
  merchantId: string;
  customerId?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  acceptedCurrencies: string[];
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  paidAmount?: number;
  paidCurrency?: string;
  transactionHash?: string;
  recipient: InvoiceRecipient;
  sender: InvoiceSender;
  notes?: string;
  terms?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Invoice recipient
 */
export interface InvoiceRecipient {
  name: string;
  email?: string;
  address?: string;
  walletAddress?: string;
}

/**
 * Invoice sender
 */
export interface InvoiceSender {
  name: string;
  email?: string;
  address?: string;
  walletAddress: string;
  logo?: string;
}

/**
 * Create invoice request
 */
export interface CreateInvoiceRequest {
  merchantId: string;
  items: Omit<InvoiceItem, 'id' | 'total' | 'taxAmount'>[];
  recipient: InvoiceRecipient;
  dueDate: Date;
  currency: string;
  acceptedCurrencies?: string[];
  notes?: string;
  terms?: string;
  taxRate?: number;
  discount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Invoice payment
 */
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  transactionHash: string;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: Date;
}

/**
 * Invoice summary
 */
export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averagePaymentTime: number;
  currency: string;
}

/**
 * Invoice list filters
 */
export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[];
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  search?: string;
}

/**
 * Invoice template
 */
export interface InvoiceTemplate {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  items: Omit<InvoiceItem, 'id' | 'total' | 'taxAmount'>[];
  currency: string;
  acceptedCurrencies: string[];
  taxRate?: number;
  notes?: string;
  terms?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invoice PDF options
 */
export interface InvoicePDFOptions {
  includeQR: boolean;
  includeLogo: boolean;
  includePaymentInstructions: boolean;
  theme?: 'light' | 'dark';
  locale?: string;
}

/**
 * Invoice reminder
 */
export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  type: 'before_due' | 'on_due' | 'after_due';
  daysOffset: number;
  channel: 'email' | 'push' | 'sms';
  sent: boolean;
  sentAt?: Date;
  scheduledFor: Date;
}

/**
 * Invoice analytics
 */
export interface InvoiceAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    date: Date;
    invoicesCreated: number;
    invoicesPaid: number;
    totalBilled: number;
    totalCollected: number;
    averageInvoiceSize: number;
    collectionRate: number;
  }[];
  totals: InvoiceSummary;
}

