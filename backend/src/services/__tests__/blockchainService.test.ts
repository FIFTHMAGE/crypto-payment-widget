import { beforeEach, describe, expect, it, vi } from 'vitest';

import { blockchainService } from '../blockchainService';

describe('Blockchain Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactionReceipt', () => {
    it('should return transaction receipt', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const receipt = await blockchainService.getTransactionReceipt(txHash);

      expect(receipt).toBeDefined();
      expect(receipt?.transactionHash).toBe(txHash);
    });

    it('should return null for non-existent transaction', async () => {
      const receipt = await blockchainService.getTransactionReceipt('0x' + '0'.repeat(64));

      expect(receipt).toBeDefined();
    });

    it('should include block number', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const receipt = await blockchainService.getTransactionReceipt(txHash);

      expect(receipt?.blockNumber).toBeDefined();
      expect(typeof receipt?.blockNumber).toBe('number');
    });

    it('should include gas used', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const receipt = await blockchainService.getTransactionReceipt(txHash);

      expect(receipt?.gasUsed).toBeDefined();
    });
  });

  describe('getBalance', () => {
    it('should return balance for address', async () => {
      const address = '0x' + 'a'.repeat(40);
      const balance = await blockchainService.getBalance(address);

      expect(balance).toBeDefined();
      expect(balance.wei).toBeDefined();
      expect(balance.eth).toBeDefined();
    });

    it('should return balance on specific chain', async () => {
      const address = '0x' + 'a'.repeat(40);
      const balance = await blockchainService.getBalance(address, 'matic-mainnet');

      expect(balance).toBeDefined();
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for transfer', async () => {
      const estimate = await blockchainService.estimateGas({
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        value: '1000000000000000000',
      });

      expect(estimate).toBeDefined();
      expect(estimate.gasLimit).toBeDefined();
      expect(estimate.gasPrice).toBeDefined();
      expect(estimate.estimatedCost).toBeDefined();
    });

    it('should estimate gas for contract call', async () => {
      const estimate = await blockchainService.estimateGas({
        from: '0x' + 'a'.repeat(40),
        to: '0x' + 'b'.repeat(40),
        data: '0xa9059cbb' + '0'.repeat(128),
      });

      expect(estimate).toBeDefined();
    });
  });

  describe('verifyTransaction', () => {
    it('should verify valid transaction', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const result = await blockchainService.verifyTransaction(txHash);

      expect(result).toBeDefined();
      expect(result.verified).toBeDefined();
      expect(result.txHash).toBe(txHash);
    });

    it('should return verification details', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const result = await blockchainService.verifyTransaction(txHash);

      expect(result.blockNumber).toBeDefined();
      expect(result.confirmations).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should specify minimum confirmations', async () => {
      const txHash = '0x' + '1'.repeat(64);
      const result = await blockchainService.verifyTransaction(txHash, {
        minConfirmations: 12,
      });

      expect(result).toBeDefined();
    });
  });

  describe('getBlockNumber', () => {
    it('should return current block number', async () => {
      const blockNumber = await blockchainService.getBlockNumber();

      expect(blockNumber).toBeDefined();
      expect(typeof blockNumber).toBe('number');
      expect(blockNumber).toBeGreaterThan(0);
    });

    it('should return block number for specific chain', async () => {
      const blockNumber = await blockchainService.getBlockNumber('matic-mainnet');

      expect(blockNumber).toBeDefined();
      expect(typeof blockNumber).toBe('number');
    });
  });

  describe('getGasPrice', () => {
    it('should return current gas price', async () => {
      const gasPrice = await blockchainService.getGasPrice();

      expect(gasPrice).toBeDefined();
      expect(gasPrice.standard).toBeDefined();
      expect(gasPrice.fast).toBeDefined();
      expect(gasPrice.instant).toBeDefined();
    });

    it('should return gas price for specific chain', async () => {
      const gasPrice = await blockchainService.getGasPrice('matic-mainnet');

      expect(gasPrice).toBeDefined();
    });
  });

  describe('getSupportedChains', () => {
    it('should return list of supported chains', () => {
      const chains = blockchainService.getSupportedChains();

      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
      expect(chains).toContain('eth-mainnet');
    });
  });
});

