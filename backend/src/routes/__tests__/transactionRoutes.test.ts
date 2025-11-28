import express, { type Application } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import transactionRoutes from '../transactionRoutes';
import { errorHandler } from '../../middleware/errorHandler';
import { transactionService } from '../../services/transactionService';

describe('Transaction Routes', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/transactions', transactionRoutes);
    app.use(errorHandler);
  });

  beforeEach(async () => {
    await transactionService.clear();
  });

  describe('POST /transactions', () => {
    it('should create new transaction', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x' + '1'.repeat(64),
          from: '0x' + 'a'.repeat(40),
          to: '0x' + 'b'.repeat(40),
          amount: '1.0',
          token: 'ETH',
          chainId: 1,
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x123', // Invalid - too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate transaction hash format', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: 'invalid-hash',
          from: '0x' + 'a'.repeat(40),
          to: '0x' + 'b'.repeat(40),
          amount: '1.0',
        });

      expect(response.status).toBe(400);
    });

    it('should validate address format', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x' + '1'.repeat(64),
          from: 'invalid-address',
          to: '0x' + 'b'.repeat(40),
          amount: '1.0',
        });

      expect(response.status).toBe(400);
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x' + '1'.repeat(64),
          from: '0x' + 'a'.repeat(40),
          to: '0x' + 'b'.repeat(40),
          amount: '-1.0',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /transactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      for (let i = 0; i < 5; i++) {
        await transactionService.create({
          txHash: '0x' + i.toString().padStart(64, '0'),
          from: '0x' + 'a'.repeat(40),
          to: '0x' + 'b'.repeat(40),
          amount: (i + 1).toString(),
        });
      }
    });

    it('should return list of transactions', async () => {
      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should filter by status', async () => {
      // Update one transaction to confirmed
      const tx = await transactionService.findByHash(
        '0x' + '0'.padStart(64, '0')
      );
      if (tx) {
        await transactionService.update(tx.txHash, { status: 'confirmed' });
      }

      const response = await request(app)
        .get('/transactions')
        .query({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(
        response.body.data.every(
          (t: { status: string }) => t.status === 'confirmed'
        )
      ).toBe(true);
    });

    it('should filter by from address', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({ from: '0x' + 'a'.repeat(40) });

      expect(response.status).toBe(200);
    });

    it('should return empty array if no matches', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({ from: '0x' + 'z'.repeat(40) });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /transactions/:txHash', () => {
    it('should return specific transaction', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const response = await request(app).get(`/transactions/${txHash}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.txHash).toBe(txHash);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app).get(
        `/transactions/0x${'9'.repeat(64)}`
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate txHash format in URL', async () => {
      const response = await request(app).get('/transactions/invalid-hash');

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('PATCH /transactions/:txHash', () => {
    it('should update transaction status', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const response = await request(app)
        .patch(`/transactions/${txHash}`)
        .send({ status: 'confirmed' });

      expect([200, 204]).toContain(response.status);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .patch(`/transactions/0x${'9'.repeat(64)}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
    });

    it('should validate status value', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const response = await request(app)
        .patch(`/transactions/${txHash}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /transactions/:txHash', () => {
    it('should delete transaction', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const response = await request(app).delete(`/transactions/${txHash}`);

      expect([200, 204]).toContain(response.status);

      // Verify deletion
      const getResponse = await request(app).get(`/transactions/${txHash}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app).delete(
        `/transactions/0x${'9'.repeat(64)}`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /transactions/stats', () => {
    beforeEach(async () => {
      // Create transactions with different statuses
      await transactionService.create({
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const tx2 = await transactionService.create({
        txHash: '0x' + '2'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '2.0',
      });

      await transactionService.update(tx2.txHash, { status: 'confirmed' });
    });

    it('should return transaction statistics', async () => {
      const response = await request(app).get('/transactions/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.pending).toBeDefined();
      expect(response.body.data.confirmed).toBeDefined();
    });
  });
});

