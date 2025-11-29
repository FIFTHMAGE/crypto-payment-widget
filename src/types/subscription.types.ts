/**
 * Subscription Types
 * Type definitions for recurring payment subscriptions
 */

/**
 * Subscription status
 */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

/**
 * Billing interval
 */
export type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Subscription
 */
export interface Subscription {
  id: string;
  merchantId: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  paymentMethod?: PaymentMethodReference;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment method reference
 */
export interface PaymentMethodReference {
  id: string;
  type: 'wallet' | 'token_approval' | 'recurring_approval';
  walletAddress?: string;
  tokenAddress?: string;
  chainId?: number;
}

/**
 * Subscription plan
 */
export interface SubscriptionPlan {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  trialPeriodDays?: number;
  setupFee?: number;
  features: PlanFeature[];
  limits?: PlanLimits;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plan feature
 */
export interface PlanFeature {
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
}

/**
 * Plan limits
 */
export interface PlanLimits {
  maxUsers?: number;
  maxStorage?: number;
  maxRequests?: number;
  maxTransactions?: number;
  customLimits?: Record<string, number>;
}

/**
 * Create subscription request
 */
export interface CreateSubscriptionRequest {
  merchantId: string;
  customerId: string;
  planId: string;
  paymentMethod: PaymentMethodReference;
  startDate?: Date;
  trialEnd?: Date;
  coupon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Update subscription request
 */
export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
  paymentMethod?: PaymentMethodReference;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Subscription billing event
 */
export interface BillingEvent {
  id: string;
  subscriptionId: string;
  type: BillingEventType;
  amount?: number;
  currency?: string;
  status: 'success' | 'failed' | 'pending';
  transactionHash?: string;
  errorMessage?: string;
  timestamp: Date;
}

/**
 * Billing event type
 */
export type BillingEventType =
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'trial_ended'
  | 'plan_changed';

/**
 * Subscription usage
 */
export interface SubscriptionUsage {
  subscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  usageRecords: UsageRecord[];
  totalUsage: number;
  limit?: number;
  overage?: number;
}

/**
 * Usage record
 */
export interface UsageRecord {
  id: string;
  quantity: number;
  timestamp: Date;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Subscription metrics
 */
export interface SubscriptionMetrics {
  merchantId: string;
  period: 'daily' | 'weekly' | 'monthly';
  totalActive: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  churned: number;
  mrr: number;
  arr: number;
  averageLifetime: number;
  churnRate: number;
  conversionRate: number;
}

/**
 * Coupon
 */
export interface Coupon {
  id: string;
  code: string;
  merchantId: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  validFrom: Date;
  validUntil?: Date;
  appliesToPlans?: string[];
  isActive: boolean;
}

/**
 * Subscription invoice
 */
export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  transactionHash?: string;
  lineItems: InvoiceLineItem[];
}

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  period?: { start: Date; end: Date };
}

/**
 * Subscription webhook event
 */
export interface SubscriptionWebhookEvent {
  id: string;
  type: string;
  subscription: Subscription;
  previousPlan?: SubscriptionPlan;
  currentPlan?: SubscriptionPlan;
  invoice?: SubscriptionInvoice;
  timestamp: Date;
}

