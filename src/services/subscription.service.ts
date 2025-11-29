/**
 * Subscription Service
 * Handle recurring payment subscriptions
 */

export interface Subscription {
  id: string;
  merchantId: string;
  customerId: string;
  planId: string;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  trialEnd?: Date;
  paymentMethod: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalCount: number;
  trialPeriodDays?: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface CreateSubscriptionParams {
  merchantId: string;
  customerId: string;
  planId: string;
  paymentMethod: string;
  startDate?: Date;
  trialEnd?: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  planId?: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

class SubscriptionService {
  private subscriptions: Map<string, Subscription> = new Map();
  private plans: Map<string, SubscriptionPlan> = new Map();

  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    const plan = this.plans.get(params.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const startDate = params.startDate || now;
    const periodEnd = this.calculatePeriodEnd(startDate, plan.interval, plan.intervalCount);

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      merchantId: params.merchantId,
      customerId: params.customerId,
      planId: params.planId,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      status: params.trialEnd ? 'trialing' : 'active',
      currentPeriodStart: startDate,
      currentPeriodEnd: periodEnd,
      nextBillingDate: params.trialEnd || periodEnd,
      cancelAtPeriodEnd: false,
      trialEnd: params.trialEnd,
      paymentMethod: params.paymentMethod,
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.customerId === customerId);
  }

  async getMerchantSubscriptions(merchantId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.merchantId === merchantId);
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription> {
    const subscription = this.subscriptions.get(params.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const updates: Partial<Subscription> = {
      updatedAt: new Date(),
    };

    if (params.planId && params.planId !== subscription.planId) {
      const newPlan = this.plans.get(params.planId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }
      updates.planId = params.planId;
      updates.amount = newPlan.amount;
      updates.currency = newPlan.currency;
      updates.interval = newPlan.interval;
      updates.intervalCount = newPlan.intervalCount;
    }

    if (params.paymentMethod) {
      updates.paymentMethod = params.paymentMethod;
    }

    if (params.metadata) {
      updates.metadata = { ...subscription.metadata, ...params.metadata };
    }

    const updated = { ...subscription, ...updates };
    this.subscriptions.set(params.subscriptionId, updated);
    return updated;
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = new Date();
    const updates: Partial<Subscription> = {
      canceledAt: now,
      updatedAt: now,
    };

    if (immediately) {
      updates.status = 'canceled';
      updates.endedAt = now;
    } else {
      updates.cancelAtPeriodEnd = true;
    }

    const updated = { ...subscription, ...updates };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new Error('Can only pause active subscriptions');
    }

    const updated = {
      ...subscription,
      status: 'paused' as SubscriptionStatus,
      updatedAt: new Date(),
    };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'paused') {
      throw new Error('Can only resume paused subscriptions');
    }

    const updated = {
      ...subscription,
      status: 'active' as SubscriptionStatus,
      updatedAt: new Date(),
    };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  async createPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt'>): Promise<SubscriptionPlan> {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    this.plans.set(newPlan.id, newPlan);
    return newPlan;
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    return this.plans.get(planId) || null;
  }

  async getMerchantPlans(merchantId: string): Promise<SubscriptionPlan[]> {
    return Array.from(this.plans.values())
      .filter(plan => plan.merchantId === merchantId && plan.isActive);
  }

  async processBilling(subscriptionId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    try {
      // In production, process actual payment here
      const transactionId = `tx_${Date.now()}`;

      // Advance billing period
      const newPeriodStart = subscription.currentPeriodEnd;
      const newPeriodEnd = this.calculatePeriodEnd(
        newPeriodStart,
        subscription.interval,
        subscription.intervalCount
      );

      const updated = {
        ...subscription,
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
        status: 'active' as SubscriptionStatus,
        updatedAt: new Date(),
      };
      this.subscriptions.set(subscriptionId, updated);

      return { success: true, transactionId };
    } catch (error) {
      const updated = {
        ...subscription,
        status: 'past_due' as SubscriptionStatus,
        updatedAt: new Date(),
      };
      this.subscriptions.set(subscriptionId, updated);
      return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
    }
  }

  private calculatePeriodEnd(start: Date, interval: string, count: number): Date {
    const end = new Date(start);
    switch (interval) {
      case 'daily':
        end.setDate(end.getDate() + count);
        break;
      case 'weekly':
        end.setDate(end.getDate() + (count * 7));
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + count);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + count);
        break;
    }
    return end;
  }

  async getSubscriptionMetrics(merchantId: string): Promise<{
    totalActive: number;
    totalRevenue: number;
    churnRate: number;
    averageLifetime: number;
  }> {
    const subs = await this.getMerchantSubscriptions(merchantId);
    const activeSubs = subs.filter(s => s.status === 'active');
    const canceledSubs = subs.filter(s => s.status === 'canceled');

    return {
      totalActive: activeSubs.length,
      totalRevenue: activeSubs.reduce((sum, s) => sum + s.amount, 0),
      churnRate: subs.length > 0 ? (canceledSubs.length / subs.length) * 100 : 0,
      averageLifetime: 30 * 6, // Mock: 6 months average
    };
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;

