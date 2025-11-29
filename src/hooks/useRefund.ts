/**
 * useRefund Hook
 * Handle refund request operations
 */

import { useState, useCallback } from 'react';

export type RefundStatus = 
  | 'idle'
  | 'requesting'
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed';

export interface RefundRequest {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  requestedAt: Date;
  processedAt?: Date;
  transactionHash?: string;
  refundedTo?: string;
  adminNotes?: string;
}

export interface CreateRefundParams {
  paymentId: string;
  amount?: number; // If not provided, full refund
  reason: string;
}

export interface UseRefundReturn {
  refundRequest: RefundRequest | null;
  status: RefundStatus;
  error: Error | null;
  isLoading: boolean;
  createRefund: (params: CreateRefundParams) => Promise<RefundRequest | null>;
  cancelRefund: (refundId: string) => Promise<boolean>;
  getRefundStatus: (refundId: string) => Promise<RefundRequest | null>;
  getRefundHistory: (paymentId?: string) => Promise<RefundRequest[]>;
  reset: () => void;
}

export function useRefund(): UseRefundReturn {
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(null);
  const [status, setStatus] = useState<RefundStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createRefund = useCallback(async (params: CreateRefundParams): Promise<RefundRequest | null> => {
    setStatus('requesting');
    setIsLoading(true);
    setError(null);

    try {
      // Validate payment exists and is refundable
      if (!params.paymentId) {
        throw new Error('Payment ID is required');
      }

      if (!params.reason || params.reason.trim().length < 10) {
        throw new Error('Please provide a detailed reason (at least 10 characters)');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const request: RefundRequest = {
        id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: params.paymentId,
        amount: params.amount ?? 100, // Mock original amount
        currency: 'USDC',
        reason: params.reason,
        status: 'pending',
        requestedAt: new Date(),
      };

      setRefundRequest(request);
      setStatus('pending');
      return request;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create refund request');
      setError(error);
      setStatus('failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelRefund = useCallback(async (refundId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!refundRequest || refundRequest.id !== refundId) {
        throw new Error('Refund request not found');
      }

      if (!['pending', 'requesting'].includes(refundRequest.status)) {
        throw new Error('Cannot cancel refund in current status');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      setRefundRequest(null);
      setStatus('idle');
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel refund');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refundRequest]);

  const getRefundStatus = useCallback(async (refundId: string): Promise<RefundRequest | null> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock status check - in production, fetch from API
      if (refundRequest?.id === refundId) {
        return refundRequest;
      }

      return null;
    } catch (err) {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refundRequest]);

  const getRefundHistory = useCallback(async (paymentId?: string): Promise<RefundRequest[]> => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock history
      const mockHistory: RefundRequest[] = [
        {
          id: 'refund_1',
          paymentId: 'pay_1',
          amount: 50.00,
          currency: 'USDC',
          reason: 'Product not as described',
          status: 'completed',
          requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          transactionHash: '0x123...abc',
          refundedTo: '0xuser...addr',
        },
        {
          id: 'refund_2',
          paymentId: 'pay_2',
          amount: 25.50,
          currency: 'USDC',
          reason: 'Duplicate payment',
          status: 'approved',
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      if (paymentId) {
        return mockHistory.filter(r => r.paymentId === paymentId);
      }

      return mockHistory;
    } catch (err) {
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRefundRequest(null);
    setStatus('idle');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    refundRequest,
    status,
    error,
    isLoading,
    createRefund,
    cancelRefund,
    getRefundStatus,
    getRefundHistory,
    reset,
  };
}

export default useRefund;

