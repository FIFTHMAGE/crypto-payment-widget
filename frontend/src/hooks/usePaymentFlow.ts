/**
 * usePaymentFlow - Comprehensive payment flow management hook
 * @module hooks/usePaymentFlow
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';

export enum PaymentStep {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  WALLET_CONNECT = 'wallet_connect',
  TOKEN_APPROVAL = 'token_approval',
  CONFIRMING = 'confirming',
  PROCESSING = 'processing',
  CONFIRMING_TRANSACTION = 'confirming_transaction',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum PaymentType {
  DIRECT = 'direct',
  ESCROW = 'escrow',
  SPLIT = 'split',
  BATCH = 'batch',
  SUBSCRIPTION = 'subscription',
  STREAM = 'stream'
}

export interface PaymentParams {
  type: PaymentType;
  amount: string;
  token: string;
  recipient: string;
  metadata?: Record<string, any>;
  options?: {
    requireApproval?: boolean;
    confirmations?: number;
    timeout?: number;
  };
}

export interface PaymentState {
  step: PaymentStep;
  transactionHash?: string;
  paymentId?: string;
  confirmations: number;
  error?: Error;
  retryCount: number;
}

export interface PaymentFlowHook {
  // State
  state: PaymentState;
  isProcessing: boolean;
  canRetry: boolean;
  progress: number;

  // Actions
  initiate: (params: PaymentParams) => Promise<void>;
  approve: () => Promise<void>;
  confirm: () => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
  reset: () => void;

  // Getters
  getStepDescription: () => string;
  getEstimatedTime: () => number;
}

const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 300000; // 5 minutes
const CONFIRMATION_POLLING_INTERVAL = 5000; // 5 seconds

export function usePaymentFlow(): PaymentFlowHook {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [state, setState] = useState<PaymentState>({
    step: PaymentStep.IDLE,
    confirmations: 0,
    retryCount: 0
  });

  const [currentParams, setCurrentParams] = useState<PaymentParams | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Calculate progress percentage
   */
  const progress = useCallback((): number => {
    const stepProgress: Record<PaymentStep, number> = {
      [PaymentStep.IDLE]: 0,
      [PaymentStep.INITIALIZING]: 10,
      [PaymentStep.WALLET_CONNECT]: 20,
      [PaymentStep.TOKEN_APPROVAL]: 40,
      [PaymentStep.CONFIRMING]: 60,
      [PaymentStep.PROCESSING]: 70,
      [PaymentStep.CONFIRMING_TRANSACTION]: 85,
      [PaymentStep.SUCCESS]: 100,
      [PaymentStep.ERROR]: 0
    };

    let baseProgress = stepProgress[state.step] || 0;

    // Add confirmation progress
    if (state.step === PaymentStep.CONFIRMING_TRANSACTION && currentParams?.options?.confirmations) {
      const confirmProgress = (state.confirmations / currentParams.options.confirmations) * 15;
      baseProgress += confirmProgress;
    }

    return Math.min(baseProgress, 100);
  }, [state.step, state.confirmations, currentParams]);

  /**
   * Get step description
   */
  const getStepDescription = useCallback((): string => {
    const descriptions: Record<PaymentStep, string> = {
      [PaymentStep.IDLE]: 'Ready to start payment',
      [PaymentStep.INITIALIZING]: 'Initializing payment...',
      [PaymentStep.WALLET_CONNECT]: 'Please connect your wallet',
      [PaymentStep.TOKEN_APPROVAL]: 'Approving token spending...',
      [PaymentStep.CONFIRMING]: 'Please confirm the transaction in your wallet',
      [PaymentStep.PROCESSING]: 'Processing payment...',
      [PaymentStep.CONFIRMING_TRANSACTION]: `Confirming transaction (${state.confirmations}/${currentParams?.options?.confirmations || 12})`,
      [PaymentStep.SUCCESS]: 'Payment successful!',
      [PaymentStep.ERROR]: state.error?.message || 'Payment failed'
    };

    return descriptions[state.step];
  }, [state.step, state.confirmations, state.error, currentParams]);

  /**
   * Get estimated time remaining
   */
  const getEstimatedTime = useCallback((): number => {
    const timings: Record<PaymentStep, number> = {
      [PaymentStep.IDLE]: 0,
      [PaymentStep.INITIALIZING]: 5,
      [PaymentStep.WALLET_CONNECT]: 30,
      [PaymentStep.TOKEN_APPROVAL]: 30,
      [PaymentStep.CONFIRMING]: 20,
      [PaymentStep.PROCESSING]: 30,
      [PaymentStep.CONFIRMING_TRANSACTION]: 60,
      [PaymentStep.SUCCESS]: 0,
      [PaymentStep.ERROR]: 0
    };

    return timings[state.step] || 0;
  }, [state.step]);

  /**
   * Update state
   */
  const updateState = useCallback((updates: Partial<PaymentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: Error) => {
    console.error('Payment error:', error);
    updateState({
      step: PaymentStep.ERROR,
      error
    });
    clearPolling();
  }, [updateState]);

  /**
   * Clear polling intervals
   */
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  /**
   * Start confirmation polling
   */
  const startConfirmationPolling = useCallback((txHash: string) => {
    updateState({ step: PaymentStep.CONFIRMING_TRANSACTION });

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // This would call your blockchain service to check confirmations
        // const receipt = await getTransactionReceipt(txHash);
        // updateState({ confirmations: receipt.confirmations });
        
        // Simulate for now
        updateState(prev => ({ 
          confirmations: prev.confirmations + 1 
        }));

        // Check if we have enough confirmations
        const requiredConfirmations = currentParams?.options?.confirmations || 12;
        if (state.confirmations >= requiredConfirmations) {
          clearPolling();
          updateState({ step: PaymentStep.SUCCESS });
        }
      } catch (error) {
        handleError(error as Error);
      }
    }, CONFIRMATION_POLLING_INTERVAL);

    // Set timeout
    const timeout = currentParams?.options?.timeout || DEFAULT_TIMEOUT;
    timeoutRef.current = setTimeout(() => {
      clearPolling();
      handleError(new Error('Payment confirmation timeout'));
    }, timeout);
  }, [currentParams, state.confirmations, updateState, handleError, clearPolling]);

  /**
   * Check wallet connection
   */
  const checkWalletConnection = useCallback(async (): Promise<boolean> => {
    if (!isConnected || !address) {
      updateState({ step: PaymentStep.WALLET_CONNECT });
      // Trigger wallet connection modal
      return false;
    }
    return true;
  }, [isConnected, address, updateState]);

  /**
   * Approve token spending
   */
  const approve = useCallback(async () => {
    if (!currentParams) return;

    try {
      updateState({ step: PaymentStep.TOKEN_APPROVAL });

      // This would call your contract service to approve tokens
      // const tx = await approveToken(currentParams.token, currentParams.amount);
      // await tx.wait();

      // Simulate approval
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateState({ step: PaymentStep.CONFIRMING });
    } catch (error) {
      handleError(error as Error);
    }
  }, [currentParams, updateState, handleError]);

  /**
   * Confirm and execute payment
   */
  const confirm = useCallback(async () => {
    if (!currentParams) return;

    try {
      updateState({ step: PaymentStep.PROCESSING });

      // This would call your payment service
      // const result = await processPayment(currentParams);
      // const txHash = result.transactionHash;

      // Simulate payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTxHash = '0x' + Math.random().toString(16).substring(2);

      updateState({
        transactionHash: mockTxHash,
        paymentId: 'payment_' + Date.now()
      });

      // Start polling for confirmations
      startConfirmationPolling(mockTxHash);
    } catch (error) {
      handleError(error as Error);
    }
  }, [currentParams, updateState, handleError, startConfirmationPolling]);

  /**
   * Initiate payment flow
   */
  const initiate = useCallback(async (params: PaymentParams) => {
    try {
      reset();
      setCurrentParams(params);
      updateState({ step: PaymentStep.INITIALIZING });

      // Check wallet connection
      const isWalletConnected = await checkWalletConnection();
      if (!isWalletConnected) return;

      // Check if approval is needed
      if (params.options?.requireApproval) {
        await approve();
      } else {
        updateState({ step: PaymentStep.CONFIRMING });
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [updateState, checkWalletConnection, approve, handleError]);

  /**
   * Retry failed payment
   */
  const retry = useCallback(async () => {
    if (!currentParams || state.retryCount >= MAX_RETRIES) return;

    updateState({ 
      retryCount: state.retryCount + 1,
      error: undefined
    });

    await initiate(currentParams);
  }, [currentParams, state.retryCount, updateState, initiate]);

  /**
   * Cancel payment
   */
  const cancel = useCallback(() => {
    clearPolling();
    updateState({ step: PaymentStep.IDLE });
    setCurrentParams(null);
  }, [clearPolling, updateState]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    clearPolling();
    setState({
      step: PaymentStep.IDLE,
      confirmations: 0,
      retryCount: 0
    });
    setCurrentParams(null);
  }, [clearPolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return {
    state,
    isProcessing: [
      PaymentStep.INITIALIZING,
      PaymentStep.TOKEN_APPROVAL,
      PaymentStep.PROCESSING,
      PaymentStep.CONFIRMING_TRANSACTION
    ].includes(state.step),
    canRetry: state.step === PaymentStep.ERROR && state.retryCount < MAX_RETRIES,
    progress: progress(),
    initiate,
    approve,
    confirm,
    retry,
    cancel,
    reset,
    getStepDescription,
    getEstimatedTime
  };
}

