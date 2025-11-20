/**
 * Enhanced Webhook Service with retry logic and signature verification
 * @module services/EnhancedWebhookService
 */

import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

export enum WebhookEvent {
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_PROCESSING = 'payment.processing',
  PAYMENT_CONFIRMED = 'payment.confirmed',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CANCELLED = 'payment.cancelled',
  PAYMENT_REFUNDED = 'payment.refunded',
  PAYMENT_DISPUTED = 'payment.disputed',
  ESCROW_CREATED = 'escrow.created',
  ESCROW_RELEASED = 'escrow.released',
  ESCROW_REFUNDED = 'escrow.refunded',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_RENEWED = 'subscription.renewed',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  STREAM_STARTED = 'stream.started',
  STREAM_WITHDRAWN = 'stream.withdrawn',
  STREAM_COMPLETED = 'stream.completed'
}

export enum WebhookStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  EXHAUSTED = 'exhausted'
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  url: string;
  payload: WebhookPayload;
  signature: string;
  status: WebhookStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  description?: string;
  metadata?: Record<string, any>;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookConfig {
  maxAttempts: number;
  retryDelay: number; // milliseconds
  retryMultiplier: number;
  timeout: number; // milliseconds
  signatureHeader: string;
  timestampHeader: string;
}

export class EnhancedWebhookService {
  private config: WebhookConfig = {
    maxAttempts: 5,
    retryDelay: 1000,
    retryMultiplier: 2,
    timeout: 10000,
    signatureHeader: 'X-Webhook-Signature',
    timestampHeader: 'X-Webhook-Timestamp'
  };

  private deliveries: Map<string, WebhookDelivery> = new Map();
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private retryQueue: Set<string> = new Set();

  constructor(config?: Partial<WebhookConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.startRetryWorker();
  }

  /**
   * Register a webhook endpoint
   */
  async registerEndpoint(endpoint: Omit<WebhookEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookEndpoint> {
    const id = this.generateId();
    const now = new Date();
    
    const webhookEndpoint: WebhookEndpoint = {
      id,
      ...endpoint,
      createdAt: now,
      updatedAt: now
    };

    this.endpoints.set(id, webhookEndpoint);
    return webhookEndpoint;
  }

  /**
   * Update webhook endpoint
   */
  async updateEndpoint(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) {
      throw new Error('Webhook endpoint not found');
    }

    const updated = {
      ...endpoint,
      ...updates,
      updatedAt: new Date()
    };

    this.endpoints.set(id, updated);
    return updated;
  }

  /**
   * Delete webhook endpoint
   */
  async deleteEndpoint(id: string): Promise<void> {
    this.endpoints.delete(id);
  }

  /**
   * Get all endpoints
   */
  async getEndpoints(): Promise<WebhookEndpoint[]> {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get endpoints subscribed to an event
   */
  async getEndpointsForEvent(event: WebhookEvent): Promise<WebhookEndpoint[]> {
    return Array.from(this.endpoints.values()).filter(
      endpoint => endpoint.enabled && endpoint.events.includes(event)
    );
  }

  /**
   * Send webhook event
   */
  async sendEvent(event: WebhookEvent, data: any, metadata?: Record<string, any>): Promise<WebhookDelivery[]> {
    const endpoints = await this.getEndpointsForEvent(event);
    const deliveries: WebhookDelivery[] = [];

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata
    };

    for (const endpoint of endpoints) {
      const delivery = await this.createDelivery(endpoint, payload);
      deliveries.push(delivery);
      await this.attemptDelivery(delivery);
    }

    return deliveries;
  }

  /**
   * Create webhook delivery record
   */
  private async createDelivery(
    endpoint: WebhookEndpoint,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
    const id = this.generateId();
    const signature = this.generateSignature(payload, endpoint.secret);

    const delivery: WebhookDelivery = {
      id,
      webhookId: endpoint.id,
      url: endpoint.url,
      payload,
      signature,
      status: WebhookStatus.PENDING,
      attempts: 0,
      maxAttempts: this.config.maxAttempts,
      createdAt: new Date()
    };

    this.deliveries.set(id, delivery);
    return delivery;
  }

  /**
   * Attempt webhook delivery
   */
  private async attemptDelivery(delivery: WebhookDelivery): Promise<void> {
    delivery.attempts++;
    delivery.lastAttemptAt = new Date();
    delivery.status = WebhookStatus.SENT;

    const endpoint = this.endpoints.get(delivery.webhookId);
    if (!endpoint) {
      delivery.status = WebhookStatus.FAILED;
      delivery.errorMessage = 'Endpoint not found';
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      [this.config.signatureHeader]: delivery.signature,
      [this.config.timestampHeader]: delivery.payload.timestamp,
      ...endpoint.headers
    };

    try {
      const response = await axios.post(delivery.url, delivery.payload, {
        headers,
        timeout: this.config.timeout,
        validateStatus: () => true // Don't throw on non-2xx status
      });

      delivery.responseStatus = response.status;
      delivery.responseBody = JSON.stringify(response.data);

      if (response.status >= 200 && response.status < 300) {
        delivery.status = WebhookStatus.DELIVERED;
        delivery.deliveredAt = new Date();
      } else {
        this.scheduleRetry(delivery);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      delivery.errorMessage = axiosError.message;
      this.scheduleRetry(delivery);
    }

    this.deliveries.set(delivery.id, delivery);
  }

  /**
   * Schedule retry for failed delivery
   */
  private scheduleRetry(delivery: WebhookDelivery): void {
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = WebhookStatus.EXHAUSTED;
      return;
    }

    delivery.status = WebhookStatus.RETRYING;
    
    // Calculate exponential backoff
    const delay = this.config.retryDelay * Math.pow(this.config.retryMultiplier, delivery.attempts - 1);
    delivery.nextRetryAt = new Date(Date.now() + delay);
    
    this.retryQueue.add(delivery.id);
  }

  /**
   * Start retry worker
   */
  private startRetryWorker(): void {
    setInterval(() => {
      this.processRetryQueue();
    }, 1000); // Check every second
  }

  /**
   * Process retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const now = Date.now();

    for (const deliveryId of this.retryQueue) {
      const delivery = this.deliveries.get(deliveryId);
      
      if (!delivery) {
        this.retryQueue.delete(deliveryId);
        continue;
      }

      if (delivery.nextRetryAt && delivery.nextRetryAt.getTime() <= now) {
        this.retryQueue.delete(deliveryId);
        await this.attemptDelivery(delivery);
      }
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get delivery status
   */
  async getDelivery(id: string): Promise<WebhookDelivery | null> {
    return this.deliveries.get(id) || null;
  }

  /**
   * Get all deliveries for webhook
   */
  async getDeliveriesForWebhook(webhookId: string): Promise<WebhookDelivery[]> {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.webhookId === webhookId
    );
  }

  /**
   * Get failed deliveries
   */
  async getFailedDeliveries(): Promise<WebhookDelivery[]> {
    return Array.from(this.deliveries.values()).filter(
      delivery => delivery.status === WebhookStatus.FAILED || delivery.status === WebhookStatus.EXHAUSTED
    );
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(id: string): Promise<void> {
    const delivery = this.deliveries.get(id);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (delivery.status === WebhookStatus.EXHAUSTED) {
      // Reset for manual retry
      delivery.attempts = 0;
      delivery.status = WebhookStatus.PENDING;
    }

    await this.attemptDelivery(delivery);
  }

  /**
   * Get webhook statistics
   */
  async getStatistics(webhookId?: string): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    retrying: number;
    successRate: number;
  }> {
    let deliveries = Array.from(this.deliveries.values());
    
    if (webhookId) {
      deliveries = deliveries.filter(d => d.webhookId === webhookId);
    }

    const total = deliveries.length;
    const delivered = deliveries.filter(d => d.status === WebhookStatus.DELIVERED).length;
    const failed = deliveries.filter(d => d.status === WebhookStatus.FAILED || d.status === WebhookStatus.EXHAUSTED).length;
    const pending = deliveries.filter(d => d.status === WebhookStatus.PENDING).length;
    const retrying = deliveries.filter(d => d.status === WebhookStatus.RETRYING).length;
    const successRate = total > 0 ? (delivered / total) * 100 : 0;

    return {
      total,
      delivered,
      failed,
      pending,
      retrying,
      successRate
    };
  }

  /**
   * Test webhook endpoint
   */
  async testEndpoint(endpointId: string): Promise<boolean> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const testPayload: WebhookPayload = {
      event: WebhookEvent.PAYMENT_CREATED,
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook'
      }
    };

    const delivery = await this.createDelivery(endpoint, testPayload);
    await this.attemptDelivery(delivery);

    return delivery.status === WebhookStatus.DELIVERED;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Clean up old deliveries
   */
  async cleanupOldDeliveries(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let removed = 0;
    for (const [id, delivery] of this.deliveries.entries()) {
      if (delivery.createdAt < cutoffDate && 
          (delivery.status === WebhookStatus.DELIVERED || delivery.status === WebhookStatus.EXHAUSTED)) {
        this.deliveries.delete(id);
        removed++;
      }
    }

    return removed;
  }
}

// Singleton instance
export const webhookService = new EnhancedWebhookService();

