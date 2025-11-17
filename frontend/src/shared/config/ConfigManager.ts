/**
 * @title ConfigManager
 * @description Centralized configuration management
 */

import { z } from 'zod';

const configSchema = z.object({
  apiUrl: z.string().url(),
  chainId: z.number().positive(),
  enableDebug: z.boolean(),
  walletConnectProjectId: z.string().min(1),
});

export class ConfigManager {
  private static instance: ConfigManager;
  private config: z.infer<typeof configSchema>;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig() {
    const config = {
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '1'),
      enableDebug: import.meta.env.VITE_DEBUG === 'true',
      walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
    };

    return configSchema.parse(config);
  }

  get<K extends keyof z.infer<typeof configSchema>>(key: K) {
    return this.config[key];
  }
}

