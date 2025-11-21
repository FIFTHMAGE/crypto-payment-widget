/**
 * CORS Middleware
 * Configurable Cross-Origin Resource Sharing middleware
 */

import cors, { CorsOptions } from 'cors';
import { Request } from 'express';
import logger from '../utils/logger';

export class CorsMiddleware {
  /**
   * Development CORS - allows all origins
   */
  public static development() {
    return cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
      maxAge: 86400, // 24 hours
    });
  }

  /**
   * Production CORS - whitelist specific origins
   */
  public static production(allowedOrigins: string[]) {
    const options: CorsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
      maxAge: 600, // 10 minutes
    };

    return cors(options);
  }

  /**
   * Dynamic CORS - check against database or config
   */
  public static dynamic(checkOrigin: (origin: string) => Promise<boolean>) {
    const options: CorsOptions = {
      origin: async (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        try {
          const allowed = await checkOrigin(origin);
          if (allowed) {
            callback(null, true);
          } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        } catch (error) {
          logger.error('Error checking CORS origin:', error);
          callback(error as Error);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    };

    return cors(options);
  }

  /**
   * Regex-based CORS matching
   */
  public static pattern(patterns: RegExp[]) {
    const options: CorsOptions = {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const matches = patterns.some((pattern) => pattern.test(origin));
        if (matches) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    };

    return cors(options);
  }

  /**
   * Subdomain-aware CORS
   */
  public static subdomains(baseDomain: string) {
    const pattern = new RegExp(`^https?://([a-zA-Z0-9-]+\\.)?${baseDomain.replace('.', '\\.')}$`);

    return CorsMiddleware.pattern([pattern]);
  }

  /**
   * Public API CORS - very permissive
   */
  public static publicApi() {
    return cors({
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'X-API-Key'],
      maxAge: 3600,
    });
  }

  /**
   * Webhook CORS - for webhook endpoints
   */
  public static webhook() {
    return cors({
      origin: false, // No CORS for webhooks
      methods: ['POST'],
    });
  }

  /**
   * Custom CORS with full control
   */
  public static custom(options: CorsOptions) {
    return cors(options);
  }
}

