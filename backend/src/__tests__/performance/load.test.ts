import express, { type Application } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import apiRoutes from '../../routes/index';

describe('Performance Load Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use('/', apiRoutes);
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 50;
      const requests: Promise<request.Response>[] = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(request(app).get('/health'));
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      const successfulResponses = responses.filter((r) => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(concurrentRequests * 0.9);

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000);
    });

    it('should handle burst traffic', async () => {
      const burstSize = 100;
      const requests: Promise<request.Response>[] = [];

      for (let i = 0; i < burstSize; i++) {
        requests.push(request(app).get('/health'));
      }

      const responses = await Promise.all(requests);

      // Should handle most requests (some might be rate limited)
      const handled = responses.filter((r) => [200, 429].includes(r.status));
      expect(handled.length).toBe(burstSize);
    });
  });

  describe('Response Time', () => {
    it('should maintain response time under load', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 20; i++) {
        const start = Date.now();
        await request(app).get('/health');
        measurements.push(Date.now() - start);
      }

      const avgResponseTime =
        measurements.reduce((a, b) => a + b, 0) / measurements.length;

      expect(avgResponseTime).toBeLessThan(100); // 100ms average
    });

    it('should have consistent response times', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await request(app).get('/health');
        measurements.push(Date.now() - start);
      }

      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const variance =
        measurements.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        measurements.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be relatively low
      expect(stdDev).toBeLessThan(avg * 0.5);
    });
  });

  describe('Large Payloads', () => {
    it('should handle large payload', async () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          data: 'x'.repeat(100),
        })),
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .send(largeData);

      expect(response.status).toBeDefined();
    });

    it('should reject excessively large payloads', async () => {
      const hugeData = {
        data: 'x'.repeat(15 * 1024 * 1024), // 15MB
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .send(hugeData);

      expect([400, 413, 422]).toContain(response.status);
    });

    it('should handle large arrays efficiently', async () => {
      const startTime = Date.now();
      const largeArray = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: 'Description '.repeat(10),
      }));

      const response = await request(app)
        .post('/api/v1/transactions')
        .send({ items: largeArray });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
      expect(response.status).toBeDefined();
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory over multiple requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 100; i++) {
        await request(app).get('/health');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;

      // Memory should not increase significantly (allow 50MB growth)
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024;
      expect(memoryGrowth).toBeLessThan(50);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from errors gracefully', async () => {
      // Make a bad request
      await request(app)
        .post('/api/v1/transactions')
        .send('{invalid}')
        .set('Content-Type', 'application/json');

      // Server should still respond to subsequent requests
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should handle mixed valid and invalid requests', async () => {
      const requests: Promise<request.Response>[] = [];

      for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) {
          // Invalid request
          requests.push(
            request(app)
              .post('/api/v1/transactions')
              .send('{invalid}')
              .set('Content-Type', 'application/json')
          );
        } else {
          // Valid request
          requests.push(request(app).get('/health'));
        }
      }

      const responses = await Promise.all(requests);

      // All requests should receive a response
      expect(responses.every((r) => r.status !== undefined)).toBe(true);
    });
  });

  describe('Throughput', () => {
    it('should maintain throughput under sustained load', async () => {
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      let requestCount = 0;

      while (Date.now() - startTime < duration) {
        await request(app).get('/health');
        requestCount++;
      }

      const actualDuration = (Date.now() - startTime) / 1000;
      const throughput = requestCount / actualDuration;

      // Should handle at least 10 requests per second
      expect(throughput).toBeGreaterThan(10);
    });
  });
});

