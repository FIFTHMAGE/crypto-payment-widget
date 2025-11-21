/**
 * Payment API Integration Tests
 * End-to-end tests for payment API endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';
import { PaymentStatus } from '../../src/types/payment';

describe('Payment API Integration Tests', () => {
  let authToken: string;
  let testMerchantId: string;
  let testPaymentId: string;

  beforeAll(async () => {
    // Setup test database
    // Get auth token for testing
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
      });

    authToken = loginResponse.body.data.token;
    testMerchantId = loginResponse.body.data.merchantId;
  });

  afterAll(async () => {
    // Cleanup test data
  });

  beforeEach(() => {
    // Reset between tests if needed
  });

  describe('POST /api/payments', () => {
    it('should create a new payment successfully', async () => {
      const paymentData = {
        amount: '100.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
        description: 'Test payment',
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.amount).toBe(paymentData.amount);
      expect(response.body.data.status).toBe(PaymentStatus.PENDING);

      testPaymentId = response.body.data.id;
    });

    it('should reject payment without authentication', async () => {
      const paymentData = {
        amount: '100.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
      };

      await request(app).post('/api/payments').send(paymentData).expect(401);
    });

    it('should reject payment with invalid amount', async () => {
      const paymentData = {
        amount: '-50.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('amount');
    });

    it('should reject payment with invalid recipient address', async () => {
      const paymentData = {
        amount: '100.00',
        currency: 'USD',
        recipient: 'invalid-address',
      };

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('address');
    });

    it('should handle duplicate payment requests', async () => {
      const paymentData = {
        amount: '100.00',
        currency: 'USD',
        recipient: '0x1234567890123456789012345678901234567890',
        idempotencyKey: 'test-key-123',
      };

      // First request
      const response1 = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      // Duplicate request with same idempotency key
      const response2 = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response1.body.data.id).toBe(response2.body.data.id);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should retrieve payment by ID', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testPaymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      await request(app)
        .get('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow access to other merchant payments', async () => {
      // Create payment with different merchant
      // Try to access with current merchant
      // Should return 403 or 404
    });
  });

  describe('GET /api/payments', () => {
    it('should list payments with pagination', async () => {
      const response = await request(app)
        .get('/api/payments')
        .query({ limit: 10, offset: 0 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/payments')
        .query({ status: PaymentStatus.SUCCEEDED })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((payment: any) => {
        expect(payment.status).toBe(PaymentStatus.SUCCEEDED);
      });
    });

    it('should filter payments by date range', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();

      const response = await request(app)
        .get('/api/payments')
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((payment: any) => {
        const createdAt = new Date(payment.createdAt);
        expect(createdAt >= new Date(startDate)).toBe(true);
        expect(createdAt <= new Date(endDate)).toBe(true);
      });
    });

    it('should sort payments by creation date', async () => {
      const response = await request(app)
        .get('/api/payments')
        .query({ sortBy: 'createdAt', order: 'desc' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const dates = response.body.data.map((p: any) => new Date(p.createdAt).getTime());

      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('POST /api/payments/:id/process', () => {
    it('should process pending payment', async () => {
      const response = await request(app)
        .post(`/api/payments/${testPaymentId}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect([PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED]).toContain(
        response.body.data.status,
      );
    });

    it('should not process already completed payment', async () => {
      // Create and complete a payment first
      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '50.00',
          currency: 'USD',
          recipient: '0x1234567890123456789012345678901234567890',
        });

      const paymentId = createResponse.body.data.id;

      // Process it
      await request(app)
        .post(`/api/payments/${paymentId}/process`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to process again
      const response = await request(app)
        .post(`/api/payments/${paymentId}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payments/:id/cancel', () => {
    it('should cancel pending payment', async () => {
      // Create a new payment
      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '75.00',
          currency: 'USD',
          recipient: '0x1234567890123456789012345678901234567890',
        });

      const paymentId = createResponse.body.data.id;

      // Cancel it
      const response = await request(app)
        .post(`/api/payments/${paymentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should not cancel completed payment', async () => {
      // Create and complete a payment
      // Try to cancel - should fail
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    it('should refund completed payment', async () => {
      // Create and complete a payment
      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '200.00',
          currency: 'USD',
          recipient: '0x1234567890123456789012345678901234567890',
        });

      const paymentId = createResponse.body.data.id;

      // Process it
      await request(app)
        .post(`/api/payments/${paymentId}/process`)
        .set('Authorization', `Bearer ${authToken}`);

      // Wait for completion (in real test, would use polling or webhook)

      // Refund it
      const response = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Customer request' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should not refund pending payment', async () => {
      const response = await request(app)
        .post(`/api/payments/${testPaymentId}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('should return payment statistics', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPayments');
      expect(response.body.data).toHaveProperty('successRate');
      expect(response.body.data).toHaveProperty('totalVolume');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const promises = [];

      // Make many requests quickly
      for (let i = 0; i < 150; i++) {
        promises.push(
          request(app)
            .get('/api/payments')
            .set('Authorization', `Bearer ${authToken}`),
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should create multiple payments in batch', async () => {
      const payments = [
        {
          amount: '10.00',
          currency: 'USD',
          recipient: '0x1111111111111111111111111111111111111111',
        },
        {
          amount: '20.00',
          currency: 'USD',
          recipient: '0x2222222222222222222222222222222222222222',
        },
        {
          amount: '30.00',
          currency: 'USD',
          recipient: '0x3333333333333333333333333333333333333333',
        },
      ];

      const response = await request(app)
        .post('/api/payments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ payments })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((p: any) => p.status === PaymentStatus.PENDING)).toBe(
        true,
      );
    });
  });
});

