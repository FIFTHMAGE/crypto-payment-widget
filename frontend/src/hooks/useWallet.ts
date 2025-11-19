import { useState, useEffect } from 'react';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  });

  const connect = async () => {
    setState(prev => ({ ...prev, isConnecting: true }));
    // Connection logic here
    setState(prev => ({ ...prev, isConnecting: false, isConnected: true }));
  };

  const disconnect = () => {
    setState({ address: null, isConnected: false, isConnecting: false, chainId: null });
  };

  return { ...state, connect, disconnect };
};
