/**
 * Configuration module - Central export for all configuration
 */

// Environment configuration
export {
  config,
  isDevelopment,
  isProduction,
  isTest,
  getEnvVariable,
  getRequiredEnvVariable,
} from './env';

export type { AppConfig } from './env';

// CORS configuration
export { corsOptions, createCorsOptions, isOriginAllowed } from './cors';

// Re-export other config modules if they exist
export * from './database';
export * from './redis';

