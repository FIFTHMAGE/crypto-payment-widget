/**
 * Environment configuration
 * @module config
 */

import dotenv from 'dotenv';
import { Logger } from '../utils/logger';

dotenv.config();

const logger = new Logger('Environment');

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  JWT_SECRET: string;
  API_KEYS: Record<string, { id: string; role: string }>;
}

function validateEnv(): EnvironmentConfig {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'REDIS_HOST',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.critical(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
    JWT_SECRET: process.env.JWT_SECRET!,
    API_KEYS: JSON.parse(process.env.API_KEYS || '{}'),
  };
}

export const env = validateEnv();

logger.info(`Environment loaded: ${env.NODE_ENV}`);
