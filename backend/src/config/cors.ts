import { type CorsOptions } from 'cors';

import { config } from './env';

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

/**
 * CORS configuration for the application
 */
export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: CorsOriginCallback
  ): void => {
    const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());

    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Request-ID',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
};

/**
 * Create custom CORS options with specific origins
 */
export function createCorsOptions(allowedOrigins: string[]): CorsOptions {
  return {
    ...corsOptions,
    origin: (
      origin: string | undefined,
      callback: CorsOriginCallback
    ): void => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
  };
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

