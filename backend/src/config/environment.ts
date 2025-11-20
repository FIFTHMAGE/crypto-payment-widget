/**
 * Environment Configuration
 * @module config
 */

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  allowedOrigins: string[];
  logLevel: string;
  platformFee: number;
}

export const environment: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || 'change_this_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  logLevel: process.env.LOG_LEVEL || 'info',
  platformFee: parseInt(process.env.PLATFORM_FEE || '250'),
};

export const isDevelopment = environment.nodeEnv === 'development';
export const isProduction = environment.nodeEnv === 'production';
export const isTest = environment.nodeEnv === 'test';

