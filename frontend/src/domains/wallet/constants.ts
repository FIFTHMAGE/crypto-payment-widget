export const WALLET_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export const SUPPORTED_CHAINS = [1, 137, 42161, 10, 8453] as const;
