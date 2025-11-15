import type { Address } from 'viem'

export interface Payment {
  id: string
  txHash: string
  from: Address
  to: Address
  amount: string
  value: string
  timestamp: string
  status: PaymentStatus
  metadata?: string
  createdAt: string
}

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'

export interface EscrowPayment {
  id: string
  payer: Address
  payee: Address
  amount: string
  token: Address
  releaseTime: number
  released: boolean
  refunded: boolean
  metadata?: string
}

export interface PaymentRequest {
  amount: string
  recipient: Address
  metadata?: string
  token?: Address
}

export interface SplitPaymentRequest {
  recipients: Address[]
  amounts: string[]
  metadata?: string
  token?: Address
}

export interface TransactionResponse {
  success: boolean
  transaction?: Payment
  message?: string
  error?: string
}

export interface PaymentStats {
  totalSent: bigint
  totalReceived: bigint
  paymentCount: number
}

