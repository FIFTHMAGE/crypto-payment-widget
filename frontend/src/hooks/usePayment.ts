import { useState } from 'react';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  txHash: string | null;
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    txHash: null,
  });

  const sendPayment = async (to: string, amount: string) => {
    setState({ isProcessing: true, error: null, txHash: null });
    try {
      // Payment logic here
      const hash = '0x...';
      setState({ isProcessing: false, error: null, txHash: hash });
    } catch (error) {
      setState({ isProcessing: false, error: (error as Error).message, txHash: null });
    }
  };

  return { ...state, sendPayment };
};
