/**
 * usePayment hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { usePayment } from '../usePayment';

// Mock the payment service
vi.mock('../../services/api', () => ({
  paymentService: {
    createPayment: vi.fn(),
    getPayment: vi.fn(),
    cancelPayment: vi.fn(),
    getPaymentStatus: vi.fn(),
  },
}));

// Mock the wallet hook
vi.mock('../useWallet', () => ({
  useWallet: vi.fn(() => ({
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    isConnected: true,
    signer: {},
  })),
}));

import { paymentService } from '../../services/api';

const mockPayment = {
  id: 'pay_123',
  status: 'pending',
  amount: '100',
  tokenAddress: '0xUSDC',
  tokenSymbol: 'USDC',
  recipient: '0xRecipient',
  txHash: null,
  createdAt: Date.now(),
};

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      (paymentService.createPayment as vi.Mock).mockResolvedValue(mockPayment);

      const { result } = renderHook(() => usePayment());

      await act(async () => {
        await result.current.createPayment({
          amount: '100',
          tokenAddress: '0xUSDC',
          recipient: '0xRecipient',
        });
      });

      expect(paymentService.createPayment).toHaveBeenCalledWith({
        amount: '100',
        tokenAddress: '0xUSDC',
        recipient: '0xRecipient',
      });
      expect(result.current.payment).toEqual(mockPayment);
      expect(result.current.error).toBeNull();
    });

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create payment');
      (paymentService.createPayment as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePayment());

      await act(async () => {
        try {
          await result.current.createPayment({
            amount: '100',
            tokenAddress: '0xUSDC',
            recipient: '0xRecipient',
          });
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(error);
      expect(result.current.payment).toBeNull();
    });

    it('should set loading state during creation', async () => {
      let resolvePromise: (value: typeof mockPayment) => void;
      const pendingPromise = new Promise<typeof mockPayment>((resolve) => {
        resolvePromise = resolve;
      });
      (paymentService.createPayment as vi.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => usePayment());

      act(() => {
        result.current.createPayment({
          amount: '100',
          tokenAddress: '0xUSDC',
          recipient: '0xRecipient',
        });
      });

      expect(result.current.isCreating).toBe(true);

      await act(async () => {
        resolvePromise!(mockPayment);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('getPayment', () => {
    it('should fetch payment by ID', async () => {
      (paymentService.getPayment as vi.Mock).mockResolvedValue(mockPayment);

      const { result } = renderHook(() => usePayment());

      await act(async () => {
        await result.current.fetchPayment('pay_123');
      });

      expect(paymentService.getPayment).toHaveBeenCalledWith('pay_123');
      expect(result.current.payment).toEqual(mockPayment);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Payment not found');
      (paymentService.getPayment as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePayment());

      await act(async () => {
        try {
          await result.current.fetchPayment('invalid_id');
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment', async () => {
      const cancelledPayment = { ...mockPayment, status: 'cancelled' };
      (paymentService.cancelPayment as vi.Mock).mockResolvedValue(cancelledPayment);

      const { result } = renderHook(() => usePayment());

      // First set the payment
      act(() => {
        result.current.setPayment(mockPayment);
      });

      await act(async () => {
        await result.current.cancelPayment();
      });

      expect(paymentService.cancelPayment).toHaveBeenCalledWith('pay_123');
      expect(result.current.payment?.status).toBe('cancelled');
    });

    it('should handle cancel errors', async () => {
      const error = new Error('Cannot cancel payment');
      (paymentService.cancelPayment as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePayment());

      act(() => {
        result.current.setPayment(mockPayment);
      });

      await act(async () => {
        try {
          await result.current.cancelPayment();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('polling', () => {
    it('should poll for payment status updates', async () => {
      vi.useFakeTimers();
      const updatedPayment = { ...mockPayment, status: 'confirmed' };
      (paymentService.getPaymentStatus as vi.Mock)
        .mockResolvedValueOnce(mockPayment)
        .mockResolvedValueOnce(updatedPayment);

      const { result } = renderHook(() => usePayment({ pollInterval: 5000 }));

      act(() => {
        result.current.setPayment(mockPayment);
        result.current.startPolling();
      });

      expect(result.current.isPolling).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(paymentService.getPaymentStatus).toHaveBeenCalledWith('pay_123');

      vi.useRealTimers();
    });

    it('should stop polling when payment is confirmed', async () => {
      vi.useFakeTimers();
      const confirmedPayment = { ...mockPayment, status: 'confirmed' };
      (paymentService.getPaymentStatus as vi.Mock).mockResolvedValue(confirmedPayment);

      const { result } = renderHook(() => usePayment({ pollInterval: 5000 }));

      act(() => {
        result.current.setPayment(mockPayment);
        result.current.startPolling();
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.isPolling).toBe(false);
      expect(result.current.payment?.status).toBe('confirmed');

      vi.useRealTimers();
    });

    it('should stop polling on unmount', () => {
      vi.useFakeTimers();
      const { result, unmount } = renderHook(() => usePayment({ pollInterval: 5000 }));

      act(() => {
        result.current.setPayment(mockPayment);
        result.current.startPolling();
      });

      unmount();

      vi.advanceTimersByTime(5000);

      expect(paymentService.getPaymentStatus).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset state', async () => {
      (paymentService.createPayment as vi.Mock).mockResolvedValue(mockPayment);

      const { result } = renderHook(() => usePayment());

      await act(async () => {
        await result.current.createPayment({
          amount: '100',
          tokenAddress: '0xUSDC',
          recipient: '0xRecipient',
        });
      });

      expect(result.current.payment).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.payment).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      (paymentService.createPayment as vi.Mock).mockResolvedValue(mockPayment);

      const { result } = renderHook(() => usePayment({ onSuccess }));

      await act(async () => {
        await result.current.createPayment({
          amount: '100',
          tokenAddress: '0xUSDC',
          recipient: '0xRecipient',
        });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockPayment);
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();
      const error = new Error('Payment failed');
      (paymentService.createPayment as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePayment({ onError }));

      await act(async () => {
        try {
          await result.current.createPayment({
            amount: '100',
            tokenAddress: '0xUSDC',
            recipient: '0xRecipient',
          });
        } catch (e) {
          // Expected error
        }
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should call onStatusChange callback', async () => {
      vi.useFakeTimers();
      const onStatusChange = vi.fn();
      const confirmedPayment = { ...mockPayment, status: 'confirmed' };
      (paymentService.getPaymentStatus as vi.Mock).mockResolvedValue(confirmedPayment);

      const { result } = renderHook(() => usePayment({ onStatusChange, pollInterval: 5000 }));

      act(() => {
        result.current.setPayment(mockPayment);
        result.current.startPolling();
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(onStatusChange).toHaveBeenCalledWith('confirmed', 'pending');

      vi.useRealTimers();
    });
  });
});

