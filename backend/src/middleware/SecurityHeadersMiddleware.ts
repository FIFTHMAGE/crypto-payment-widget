/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to responses
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface SecurityHeadersOptions {
  contentSecurityPolicy?: boolean | string;
  strictTransportSecurity?: boolean | {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: boolean;
  xXssProtection?: boolean | string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

export class SecurityHeadersMiddleware {
  private static defaultOptions: SecurityHeadersOptions = {
    contentSecurityPolicy: true,
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    xXssProtection: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
  };

  /**
   * Apply security headers middleware
   */
  public static applyHeaders(options: SecurityHeadersOptions = {}) {
    const config = { ...SecurityHeadersMiddleware.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Content Security Policy
        if (config.contentSecurityPolicy) {
          const csp =
            typeof config.contentSecurityPolicy === 'string'
              ? config.contentSecurityPolicy
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https:",
                  "font-src 'self' data:",
                  "connect-src 'self'",
                  "frame-ancestors 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                ].join('; ');

          res.setHeader('Content-Security-Policy', csp);
        }

        // Strict Transport Security (HSTS)
        if (config.strictTransportSecurity) {
          const hsts =
            typeof config.strictTransportSecurity === 'object'
              ? [
                  `max-age=${config.strictTransportSecurity.maxAge || 31536000}`,
                  config.strictTransportSecurity.includeSubDomains ? 'includeSubDomains' : '',
                  config.strictTransportSecurity.preload ? 'preload' : '',
                ]
                  .filter(Boolean)
                  .join('; ')
              : 'max-age=31536000; includeSubDomains; preload';

          res.setHeader('Strict-Transport-Security', hsts);
        }

        // X-Frame-Options
        if (config.xFrameOptions) {
          res.setHeader('X-Frame-Options', config.xFrameOptions);
        }

        // X-Content-Type-Options
        if (config.xContentTypeOptions) {
          res.setHeader('X-Content-Type-Options', 'nosniff');
        }

        // X-XSS-Protection
        if (config.xXssProtection) {
          const xssProtection =
            typeof config.xXssProtection === 'string'
              ? config.xXssProtection
              : '1; mode=block';

          res.setHeader('X-XSS-Protection', xssProtection);
        }

        // Referrer-Policy
        if (config.referrerPolicy) {
          res.setHeader('Referrer-Policy', config.referrerPolicy);
        }

        // Permissions-Policy
        if (config.permissionsPolicy) {
          res.setHeader('Permissions-Policy', config.permissionsPolicy);
        }

        // Additional security headers
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        res.setHeader('X-Download-Options', 'noopen');
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

        // Remove potentially sensitive headers
        res.removeHeader('X-Powered-By');

        next();
      } catch (error) {
        logger.error('Error applying security headers:', error);
        next(error);
      }
    };
  }

  /**
   * Remove sensitive headers from response
   */
  public static removeSensitiveHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');
      next();
    };
  }

  /**
   * Add CORS security headers
   */
  public static corsSecurityHeaders(allowedOrigins: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;

      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key',
        );
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      }

      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      next();
    };
  }

  /**
   * Add Cache-Control headers for API responses
   */
  public static noCacheHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    };
  }

  /**
   * Add security headers for static assets
   */
  public static staticAssetHeaders(maxAge: number = 86400) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
      next();
    };
  }

  /**
   * Add security headers for sensitive operations
   */
  public static sensitiveOperationHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      next();
    };
  }
}
