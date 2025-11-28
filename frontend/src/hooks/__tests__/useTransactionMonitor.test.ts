/**
 * useTransactionMonitor hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useTransactionMonitor } from '../useTransactionMonitor';

// Mock ethers provider
const mockProvider = {
  getTransaction: vi.fn(),
  getTransactionReceipt: vi.fn(),
  waitForTransaction: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

vi.mock('../useWallet', () => ({
  useWallet: vi.fn(() => ({
    provider: mockProvider,
    chainId: 1,
  })),
}));

const mockTransaction = {
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  to: '0xRecipient',
  value: { toString: () => '1000000000000000000' },
  nonce: 1,
  blockNumber: null,
  confirmations: 0,
};

const mockReceipt = {
  transactionHash: mockTransaction.hash,
  status: 1,
  blockNumber: 12345,
  confirmations: 6,
  gasUsed: { toString: () => '21000' },
  effectiveGasPrice: { toString: () => '30000000000' },
};

describe('useTransactionMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have empty transactions initially', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      expect(result.current.transactions).toEqual([]);
      expect(result.current.pendingCount).toBe(0);
    });
  });

  describe('addTransaction', () => {
    it('should add a transaction to monitor', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, {
          type: 'payment',
          description: 'Send 1 ETH',
        });
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0]).toMatchObject({
        hash: mockTransaction.hash,
        status: 'pending',
        type: 'payment',
        description: 'Send 1 ETH',
      });
    });

    it('should increment pending count', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      expect(result.current.pendingCount).toBe(1);
    });

    it('should not add duplicate transactions', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      expect(result.current.transactions).toHaveLength(1);
    });
  });

  describe('monitoring', () => {
    it('should start monitoring after adding transaction', async () => {
      mockProvider.getTransaction.mockResolvedValue(mockTransaction);
      mockProvider.getTransactionReceipt.mockResolvedValue(null);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 5000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith(mockTransaction.hash);
    });

    it('should update status when transaction confirms', async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 1000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.transactions[0].status).toBe('confirmed');
      });
    });

    it('should update confirmations count', async () => {
      const receiptWith3Confirmations = { ...mockReceipt, confirmations: 3 };
      mockProvider.getTransactionReceipt.mockResolvedValue(receiptWith3Confirmations);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 1000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.transactions[0].confirmations).toBe(3);
      });
    });

    it('should detect failed transactions', async () => {
      const failedReceipt = { ...mockReceipt, status: 0 };
      mockProvider.getTransactionReceipt.mockResolvedValue(failedReceipt);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 1000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.transactions[0].status).toBe('failed');
      });
    });

    it('should decrement pending count when transaction completes', async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 1000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      expect(result.current.pendingCount).toBe(1);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(0);
      });
    });
  });

  describe('waitForTransaction', () => {
    it('should wait for specific confirmations', async () => {
      mockProvider.waitForTransaction.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      const receiptPromise = result.current.waitForConfirmation(mockTransaction.hash, 6);

      await act(async () => {
        const receipt = await receiptPromise;
        expect(receipt).toEqual(mockReceipt);
      });

      expect(mockProvider.waitForTransaction).toHaveBeenCalledWith(mockTransaction.hash, 6);
    });
  });

  describe('removeTransaction', () => {
    it('should remove a transaction', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      expect(result.current.transactions).toHaveLength(1);

      act(() => {
        result.current.removeTransaction(mockTransaction.hash);
      });

      expect(result.current.transactions).toHaveLength(0);
    });

    it('should stop monitoring removed transaction', async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue(null);

      const { result } = renderHook(() => useTransactionMonitor({ pollInterval: 1000 }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      act(() => {
        result.current.removeTransaction(mockTransaction.hash);
      });

      mockProvider.getTransactionReceipt.mockClear();

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockProvider.getTransactionReceipt).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('should clear all transactions', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction('0x111', { type: 'payment' });
        result.current.addTransaction('0x222', { type: 'approval' });
      });

      expect(result.current.transactions).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.transactions).toHaveLength(0);
      expect(result.current.pendingCount).toBe(0);
    });

    it('should only clear completed transactions', () => {
      mockProvider.getTransactionReceipt.mockResolvedValue(null);

      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction('0x111', { type: 'payment' });
        result.current.addTransaction('0x222', { type: 'approval' });
      });

      // Manually mark one as confirmed
      act(() => {
        result.current.updateTransaction('0x111', { status: 'confirmed' });
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].hash).toBe('0x222');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction by hash', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      act(() => {
        result.current.addTransaction(mockTransaction.hash, {
          type: 'payment',
          description: 'Test',
        });
      });

      const tx = result.current.getTransaction(mockTransaction.hash);

      expect(tx).toMatchObject({
        hash: mockTransaction.hash,
        type: 'payment',
        description: 'Test',
      });
    });

    it('should return undefined for non-existent transaction', () => {
      const { result } = renderHook(() => useTransactionMonitor());

      const tx = result.current.getTransaction('0xNonExistent');

      expect(tx).toBeUndefined();
    });
  });

  describe('callbacks', () => {
    it('should call onConfirmed callback', async () => {
      const onConfirmed = vi.fn();
      mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() =>
        useTransactionMonitor({ pollInterval: 1000, onConfirmed })
      );

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onConfirmed).toHaveBeenCalledWith(
          expect.objectContaining({ hash: mockTransaction.hash })
        );
      });
    });

    it('should call onFailed callback', async () => {
      const onFailed = vi.fn();
      const failedReceipt = { ...mockReceipt, status: 0 };
      mockProvider.getTransactionReceipt.mockResolvedValue(failedReceipt);

      const { result } = renderHook(() =>
        useTransactionMonitor({ pollInterval: 1000, onFailed })
      );

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onFailed).toHaveBeenCalled();
      });
    });

    it('should call onSpeedUpRequired for stuck transactions', async () => {
      const onSpeedUpRequired = vi.fn();
      mockProvider.getTransactionReceipt.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useTransactionMonitor({
          pollInterval: 1000,
          stuckThreshold: 5000,
          onSpeedUpRequired,
        })
      );

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      await act(async () => {
        vi.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(onSpeedUpRequired).toHaveBeenCalled();
      });
    });
  });

  describe('persistence', () => {
    it('should persist transactions to storage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      const { result } = renderHook(() => useTransactionMonitor({ persist: true }));

      act(() => {
        result.current.addTransaction(mockTransaction.hash, { type: 'payment' });
      });

      expect(setItemSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
    });

    it('should restore transactions from storage', () => {
      const storedTx = [
        { hash: mockTransaction.hash, type: 'payment', status: 'pending' },
      ];
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(storedTx));

      const { result } = renderHook(() => useTransactionMonitor({ persist: true }));

      expect(result.current.transactions).toHaveLength(1);

      vi.mocked(Storage.prototype.getItem).mockRestore();
    });
  });
});

