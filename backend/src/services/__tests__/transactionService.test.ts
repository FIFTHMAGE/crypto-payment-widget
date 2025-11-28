import { beforeEach, describe, expect, it } from 'vitest';

import { transactionService } from '../transactionService';

describe('Transaction Service', () => {
  beforeEach(async () => {
    // Clear transactions before each test
    await transactionService.clear();
  });

  describe('create', () => {
    it('should create new transaction', async () => {
      const txData = {
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      };

      const result = await transactionService.create(txData);

      expect(result).toMatchObject({
        txHash: txData.txHash,
        from: txData.from,
        to: txData.to,
        amount: '1.0',
        status: 'pending',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create multiple transactions', async () => {
      const tx1 = await transactionService.create({
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const tx2 = await transactionService.create({
        txHash: '0x' + '2'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'c'.repeat(40),
        amount: '2.0',
      });

      expect(tx1.id).not.toBe(tx2.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      // Create multiple transactions
      for (let i = 0; i < 25; i++) {
        await transactionService.create({
          txHash: '0x' + i.toString().padStart(64, '0'),
          from: '0x' + 'a'.repeat(40),
          to: '0x' + 'b'.repeat(40),
          amount: '1.0',
        });
      }

      const result = await transactionService.findAll({ limit: 10, offset: 0 });

      expect(result.items).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.hasMore).toBe(true);
    });

    it('should filter by status', async () => {
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

      const result = await transactionService.findAll({ status: 'confirmed' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].txHash).toBe(tx2.txHash);
    });

    it('should filter by from address', async () => {
      await transactionService.create({
        txHash: '0x' + '1'.repeat(64),
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      await transactionService.create({
        txHash: '0x' + '2'.repeat(64),
        from: '0x' + 'c'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '2.0',
      });

      const result = await transactionService.findAll({ from: '0x' + 'a'.repeat(40) });

      expect(result.items).toHaveLength(1);
    });
  });

  describe('findByHash', () => {
    it('should find transaction by hash', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const result = await transactionService.findByHash(txHash);

      expect(result).toBeDefined();
      expect(result?.txHash).toBe(txHash);
    });

    it('should return null if not found', async () => {
      const result = await transactionService.findByHash('0x' + '1'.repeat(64));

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update transaction status', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const result = await transactionService.update(txHash, { status: 'confirmed' });

      expect(result?.status).toBe('confirmed');
      expect(result?.updatedAt).toBeDefined();
    });

    it('should return null for non-existent transaction', async () => {
      const result = await transactionService.update('0x' + '1'.repeat(64), {
        status: 'confirmed',
      });

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return transaction statistics', async () => {
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

      const stats = await transactionService.getStats();

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.confirmed).toBe(1);
      expect(stats.totalVolume).toBe(3);
    });
  });

  describe('confirm', () => {
    it('should confirm a transaction', async () => {
      const txHash = '0x' + '1'.repeat(64);
      await transactionService.create({
        txHash,
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      const result = await transactionService.confirm(txHash, 12345678);

      expect(result?.status).toBe('confirmed');
      expect(result?.confirmedAt).toBeDefined();
      expect(result?.blockNumber).toBe(12345678);
    });
  });

  describe('findByAddress', () => {
    it('should find transactions by address', async () => {
      const address = '0x' + 'a'.repeat(40);

      await transactionService.create({
        txHash: '0x' + '1'.repeat(64),
        from: address,
        to: '0x' + 'b'.repeat(40),
        amount: '1.0',
      });

      await transactionService.create({
        txHash: '0x' + '2'.repeat(64),
        from: '0x' + 'c'.repeat(40),
        to: address,
        amount: '2.0',
      });

      const results = await transactionService.findByAddress(address);

      expect(results).toHaveLength(2);
    });
  });
});

