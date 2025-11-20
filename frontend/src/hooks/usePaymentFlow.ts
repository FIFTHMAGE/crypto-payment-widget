/**
 * usePaymentFlow - Hook for managing payment flow state
 * @module hooks
 */

import { useState, useCallback, useEffect } from 'react';

export enum PaymentStep {
  CONNECT_WALLET = 'connect_wallet',
  SELECT_TOKEN = 'select_token',
  ENTER_AMOUNT = 'enter_amount',
  REVIEW = 'review',
  APPROVE_TOKEN = 'approve_token',
  CONFIRM_TRANSACTION = 'confirm_transaction',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface PaymentState {
  step: PaymentStep;
  recipient: string;
  token: string;
  amount: string;
  metadata?: Record<string, any>;
  transactionHash?: string;
  error?: string;
  isApprovalRequired: boolean;
  isApproved: boolean;
}

export interface PaymentFlowCallbacks {
  onStepChange?: (step: PaymentStep) => void;
  onComplete?: (txHash: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function usePaymentFlow(initialState?: Partial<PaymentState>, callbacks?: PaymentFlowCallbacks) {
  const [state, setState] = useState<PaymentState>({
    step: PaymentStep.CONNECT_WALLET,
    recipient: '',
    token: '',
    amount: '',
    isApprovalRequired: false,
    isApproved: false,
    ...initialState,
  });

  const [history, setHistory] = useState<PaymentStep[]>([state.step]);
  const [canGoBack, setCanGoBack] = useState(false);

  // Update step and add to history
  const setStep = useCallback(
    (step: PaymentStep) => {
      setState((prev) => ({ ...prev, step }));
      setHistory((prev) => [...prev, step]);
      callbacks?.onStepChange?.(step);
    },
    [callbacks]
  );

  // Go to next step
  const nextStep = useCallback(() => {
    const stepOrder = [
      PaymentStep.CONNECT_WALLET,
      PaymentStep.SELECT_TOKEN,
      PaymentStep.ENTER_AMOUNT,
      PaymentStep.REVIEW,
      PaymentStep.APPROVE_TOKEN,
      PaymentStep.CONFIRM_TRANSACTION,
      PaymentStep.PROCESSING,
      PaymentStep.SUCCESS,
    ];

    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex < stepOrder.length - 1) {
      // Skip approval step if not required
      if (stepOrder[currentIndex + 1] === PaymentStep.APPROVE_TOKEN && !state.isApprovalRequired) {
        setStep(stepOrder[currentIndex + 2] || stepOrder[currentIndex + 1]);
      } else {
        setStep(stepOrder[currentIndex + 1]);
      }
    }
  }, [state.step, state.isApprovalRequired, setStep]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setState((prev) => ({ ...prev, step: previousStep }));
      setHistory(newHistory);
      callbacks?.onStepChange?.(previousStep);
    }
  }, [history, callbacks]);

  // Update recipient
  const setRecipient = useCallback((recipient: string) => {
    setState((prev) => ({ ...prev, recipient }));
  }, []);

  // Update token
  const setToken = useCallback((token: string, requiresApproval: boolean = false) => {
    setState((prev) => ({
      ...prev,
      token,
      isApprovalRequired: requiresApproval,
      isApproved: !requiresApproval,
    }));
  }, []);

  // Update amount
  const setAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, amount }));
  }, []);

  // Update metadata
  const setMetadata = useCallback((metadata: Record<string, any>) => {
    setState((prev) => ({ ...prev, metadata }));
  }, []);

  // Mark token as approved
  const markAsApproved = useCallback(() => {
    setState((prev) => ({ ...prev, isApproved: true }));
  }, []);

  // Set transaction hash
  const setTransactionHash = useCallback((txHash: string) => {
    setState((prev) => ({ ...prev, transactionHash: txHash }));
  }, []);

  // Set error
  const setError = useCallback(
    (error: string) => {
      setState((prev) => ({ ...prev, error }));
      setStep(PaymentStep.ERROR);
      callbacks?.onError?.(error);
    },
    [setStep, callbacks]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  // Reset flow
  const reset = useCallback(() => {
    setState({
      step: PaymentStep.CONNECT_WALLET,
      recipient: '',
      token: '',
      amount: '',
      isApprovalRequired: false,
      isApproved: false,
    });
    setHistory([PaymentStep.CONNECT_WALLET]);
  }, []);

  // Complete payment
  const complete = useCallback(
    (txHash: string) => {
      setTransactionHash(txHash);
      setStep(PaymentStep.SUCCESS);
      callbacks?.onComplete?.(txHash);
    },
    [setTransactionHash, setStep, callbacks]
  );

  // Cancel payment
  const cancel = useCallback(() => {
    callbacks?.onCancel?.();
    reset();
  }, [callbacks, reset]);

  // Validation helpers
  const isStepValid = useCallback(
    (step: PaymentStep): boolean => {
      switch (step) {
        case PaymentStep.CONNECT_WALLET:
          return true; // Assume wallet is connected if we're past this step

        case PaymentStep.SELECT_TOKEN:
          return state.token.length > 0;

        case PaymentStep.ENTER_AMOUNT:
          return parseFloat(state.amount) > 0 && state.recipient.length > 0;

        case PaymentStep.REVIEW:
          return (
            state.token.length > 0 &&
            parseFloat(state.amount) > 0 &&
            state.recipient.length > 0
          );

        case PaymentStep.APPROVE_TOKEN:
          return state.isApproved;

        default:
          return true;
      }
    },
    [state.token, state.amount, state.recipient, state.isApproved]
  );

  // Check if can proceed
  const canProceed = isStepValid(state.step);

  // Update canGoBack
  useEffect(() => {
    setCanGoBack(
      history.length > 1 &&
        state.step !== PaymentStep.PROCESSING &&
        state.step !== PaymentStep.SUCCESS &&
        state.step !== PaymentStep.ERROR
    );
  }, [history.length, state.step]);

  // Progress percentage
  const getProgress = useCallback((): number => {
    const stepProgress: Record<PaymentStep, number> = {
      [PaymentStep.CONNECT_WALLET]: 10,
      [PaymentStep.SELECT_TOKEN]: 25,
      [PaymentStep.ENTER_AMOUNT]: 40,
      [PaymentStep.REVIEW]: 60,
      [PaymentStep.APPROVE_TOKEN]: 70,
      [PaymentStep.CONFIRM_TRANSACTION]: 80,
      [PaymentStep.PROCESSING]: 90,
      [PaymentStep.SUCCESS]: 100,
      [PaymentStep.ERROR]: 0,
    };

    return stepProgress[state.step] || 0;
  }, [state.step]);

  return {
    // State
    state,
    history,
    canGoBack,
    canProceed,

    // Actions
    setStep,
    nextStep,
    previousStep,
    setRecipient,
    setToken,
    setAmount,
    setMetadata,
    markAsApproved,
    setTransactionHash,
    setError,
    clearError,
    reset,
    complete,
    cancel,

    // Helpers
    isStepValid,
    getProgress,
  };
}
