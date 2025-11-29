/**
 * usePayment Hook
 * Unified payment handling for crypto transactions
 */

import { useState, useCallback, useMemo } from 'react';

export type PaymentStatus = 
  | 'idle'
  | 'preparing'
  | 'pending_approval'
  | 'processing'
  | 'confirming'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface PaymentParams {
  amount: string;
  currency: string;
  recipient: string;
  memo?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  transactionHash: string;
  blockNumber?: number;
  timestamp: Date;
  amount: string;
  currency: string;
  recipient: string;
  fee?: string;
}

export interface UsePaymentState {
  status: PaymentStatus;
  result: PaymentResult | null;
  error: Error | null;
  progress: number;
}

export interface UsePaymentReturn extends UsePaymentState {
  initiatePayment: (params: PaymentParams) => Promise<PaymentResult | null>;
  confirmPayment: () => Promise<void>;
  cancelPayment: () => void;
  reset: () => void;
  isProcessing: boolean;
}

export function usePayment(): UsePaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [pendingParams, setPendingParams] = useState<PaymentParams | null>(null);

  const progress = useMemo(() => {
    const progressMap: Record<PaymentStatus, number> = {
      idle: 0,
      preparing: 10,
      pending_approval: 25,
      processing: 50,
      confirming: 75,
      success: 100,
      failed: 0,
      cancelled: 0,
    };
    return progressMap[status];
  }, [status]);

  const isProcessing = useMemo(() => {
    return ['preparing', 'pending_approval', 'processing', 'confirming'].includes(status);
  }, [status]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setPendingParams(null);
  }, []);

  const cancelPayment = useCallback(() => {
    if (isProcessing) {
      setStatus('cancelled');
      setError(new Error('Payment cancelled by user'));
    }
  }, [isProcessing]);

  const initiatePayment = useCallback(async (params: PaymentParams): Promise<PaymentResult | null> => {
    try {
      setError(null);
      setResult(null);
      setStatus('preparing');
      setPendingParams(params);

      // Validate params
      if (!params.amount || parseFloat(params.amount) <= 0) {
        throw new Error('Invalid payment amount');
      }
      if (!params.recipient) {
        throw new Error('Recipient address is required');
      }

      setStatus('pending_approval');

      // Simulate wallet approval
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus('processing');

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus('confirming');

      // Simulate confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentResult: PaymentResult = {
        transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        timestamp: new Date(),
        amount: params.amount,
        currency: params.currency,
        recipient: params.recipient,
        fee: (parseFloat(params.amount) * 0.001).toFixed(6),
      };

      setResult(paymentResult);
      setStatus('success');
      return paymentResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed');
      setError(error);
      setStatus('failed');
      return null;
    }
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!pendingParams) {
      throw new Error('No pending payment to confirm');
    }
    await initiatePayment(pendingParams);
  }, [pendingParams, initiatePayment]);

  return {
    status,
    result,
    error,
    progress,
    initiatePayment,
    confirmPayment,
    cancelPayment,
    reset,
    isProcessing,
  };
}

export default usePayment;

