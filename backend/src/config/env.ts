import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  logLevel: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  database: {
    url: string;
    poolSize: number;
  };
  redis: {
    url: string;
    ttl: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  blockchain: {
    rpcUrl: string;
    chainId: number;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/payments',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.CHAIN_ID || '1', 10),
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

export function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getRequiredEnvVariable(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

