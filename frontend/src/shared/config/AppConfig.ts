/**
 * @title AppConfig
 * @description Centralized configuration management
 */

export const AppConfig = {
  app: {
    name: 'Crypto Payment Widget',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retryAttempts: 3,
  },
  
  blockchain: {
    defaultChainId: 1,
    supportedChains: [1, 5, 137, 8453], // Ethereum, Goerli, Polygon, Base
  },
  
  features: {
    enableSubscriptions: true,
    enableMilestones: true,
    enableEscrow: true,
    enableStreaming: true,
  },
  
  ui: {
    toastDuration: 5000,
    modalAnimationDuration: 300,
    debounceDelay: 300,
  },
} as const;

export type AppConfigType = typeof AppConfig;

