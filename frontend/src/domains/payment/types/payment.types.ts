export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  SIMPLE = 'simple',
  SMART_CONTRACT = 'smart_contract',
  ESCROW = 'escrow',
  SPLIT = 'split',
  RECURRING = 'recurring',
}

export interface Payment {
  id: string
  payer: string
  payee: string
  amount: string
  token: string | null
  status: PaymentStatus | string
  type: PaymentType | string
  txHash?: string
  blockNumber?: number
  confirmations?: number
  timestamp: number
  metadata?: PaymentMetadata
  createdAt: string
  updatedAt: string
}

export interface PaymentMetadata {
  orderId?: string
  invoiceNumber?: string
  description?: string
  reference?: string
  customFields?: Record<string, unknown>
}

export interface ProcessPaymentParams {
  payee: string
  amount: string
  token?: string
  type?: PaymentType
  metadata?: PaymentMetadata
}

export interface PaymentResponse {
  paymentId: string
  txHash: string
  status: PaymentStatus | string
  estimatedConfirmationTime?: number
}

export interface PaymentTemplate {
  id: string
  name: string
  recipient: string
  amount: string
  token: string
  description?: string
  category: string
  usageCount: number
  createdAt: number
  updatedAt?: number
}

export interface EscrowPayment extends Payment {
  releaseTime: number
  released: boolean
  refunded: boolean
  arbiter?: string
}

export interface RecurringPayment {
  id: string
  templateId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextPaymentDate: number
  lastPaymentDate?: number
  active: boolean
  failedAttempts: number
  maxAttempts: number
}

export interface PaymentFilters {
  status?: PaymentStatus[]
  type?: PaymentType[]
  startDate?: Date
  endDate?: Date
  minAmount?: string
  maxAmount?: string
  token?: string
}

export interface PaymentStats {
  totalPayments: number
  totalVolume: string
  successRate: number
  averageAmount: string
  byStatus: Record<PaymentStatus, number>
  byToken: Record<string, { count: number; volume: string }>
}

