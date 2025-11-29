/**
 * Invoice Service
 * Generate and manage payment invoices
 */

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface Invoice {
  id: string;
  number: string;
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
  customerEmail?: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  cryptoCurrency?: string;
  cryptoAmount?: string;
  exchangeRate?: number;
  dueDate?: Date;
  status: InvoiceStatus;
  paymentLink?: string;
  transactionHash?: string;
  createdAt: Date;
  paidAt?: Date;
  memo?: string;
}

export type InvoiceStatus = 
  | 'draft'
  | 'pending'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

export interface CreateInvoiceParams {
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
  customerEmail?: string;
  customerName?: string;
  items: Omit<InvoiceItem, 'id'>[];
  currency: string;
  taxRate?: number;
  discount?: number;
  dueDate?: Date;
  memo?: string;
}

// Invoice number counter
let invoiceCounter = 1000;

// In-memory store
const invoices: Map<string, Invoice> = new Map();

class InvoiceService {
  /**
   * Generate invoice ID
   */
  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate invoice number
   */
  private generateNumber(): string {
    invoiceCounter++;
    const year = new Date().getFullYear();
    return `INV-${year}-${invoiceCounter.toString().padStart(4, '0')}`;
  }

  /**
   * Calculate totals
   */
  private calculateTotals(
    items: InvoiceItem[],
    taxRate: number = 0,
    discountAmount: number = 0
  ): { subtotal: number; tax: number; discount: number; total: number } {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * (taxRate / 100);
    const discount = discountAmount;
    const total = subtotal + tax - discount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Create new invoice
   */
  createInvoice(params: CreateInvoiceParams): Invoice {
    const items: InvoiceItem[] = params.items.map((item, index) => ({
      ...item,
      id: `item_${index + 1}`,
    }));

    const totals = this.calculateTotals(
      items,
      params.taxRate,
      params.discount
    );

    const invoice: Invoice = {
      id: this.generateId(),
      number: this.generateNumber(),
      merchantId: params.merchantId,
      merchantName: params.merchantName,
      merchantAddress: params.merchantAddress,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      items,
      ...totals,
      currency: params.currency,
      dueDate: params.dueDate,
      status: 'draft',
      createdAt: new Date(),
      memo: params.memo,
    };

    invoices.set(invoice.id, invoice);
    return invoice;
  }

  /**
   * Get invoice by ID
   */
  getInvoice(id: string): Invoice | null {
    return invoices.get(id) || null;
  }

  /**
   * Get invoice by number
   */
  getInvoiceByNumber(number: string): Invoice | null {
    return Array.from(invoices.values()).find(inv => inv.number === number) || null;
  }

  /**
   * Update invoice status
   */
  updateStatus(id: string, status: InvoiceStatus): Invoice | null {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    invoice.status = status;
    if (status === 'paid') {
      invoice.paidAt = new Date();
    }

    return invoice;
  }

  /**
   * Add crypto payment details
   */
  setCryptoPayment(
    id: string,
    cryptoCurrency: string,
    exchangeRate: number
  ): Invoice | null {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    invoice.cryptoCurrency = cryptoCurrency;
    invoice.exchangeRate = exchangeRate;
    invoice.cryptoAmount = (invoice.total / exchangeRate).toFixed(8);

    return invoice;
  }

  /**
   * Set payment link
   */
  setPaymentLink(id: string, paymentLink: string): Invoice | null {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    invoice.paymentLink = paymentLink;
    invoice.status = 'pending';

    return invoice;
  }

  /**
   * Mark as paid
   */
  markPaid(id: string, transactionHash: string): Invoice | null {
    const invoice = invoices.get(id);
    if (!invoice) return null;

    invoice.status = 'paid';
    invoice.transactionHash = transactionHash;
    invoice.paidAt = new Date();

    return invoice;
  }

  /**
   * Get invoices by merchant
   */
  getInvoicesByMerchant(merchantId: string): Invoice[] {
    return Array.from(invoices.values())
      .filter(inv => inv.merchantId === merchantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get overdue invoices
   */
  getOverdueInvoices(): Invoice[] {
    const now = new Date();
    return Array.from(invoices.values())
      .filter(inv => 
        inv.dueDate && 
        inv.dueDate < now && 
        ['pending', 'sent', 'viewed'].includes(inv.status)
      );
  }

  /**
   * Cancel invoice
   */
  cancelInvoice(id: string): Invoice | null {
    return this.updateStatus(id, 'cancelled');
  }

  /**
   * Duplicate invoice
   */
  duplicateInvoice(id: string): Invoice | null {
    const original = invoices.get(id);
    if (!original) return null;

    const newInvoice: Invoice = {
      ...original,
      id: this.generateId(),
      number: this.generateNumber(),
      status: 'draft',
      paymentLink: undefined,
      transactionHash: undefined,
      createdAt: new Date(),
      paidAt: undefined,
    };

    invoices.set(newInvoice.id, newInvoice);
    return newInvoice;
  }

  /**
   * Format invoice total
   */
  formatTotal(invoice: Invoice): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(invoice.total);
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(invoice: Invoice): boolean {
    if (!invoice.dueDate) return false;
    if (['paid', 'cancelled', 'refunded'].includes(invoice.status)) return false;
    return new Date() > invoice.dueDate;
  }
}

// Export singleton
export const invoiceService = new InvoiceService();
export { InvoiceService };
export default invoiceService;

