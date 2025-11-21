/**
 * Security Headers Middleware
 * Sets security-related HTTP headers
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface SecurityHeadersConfig {
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  contentSecurityPolicy?: {
    directives?: Record<string, string[]>;
  };
  xFrameOptions?: 'DENY' | 'SAMEORIGIN';
  xContentTypeOptions?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    'payment': ["'self'"],
  },
};

export class SecurityHeadersMiddleware {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Apply security headers middleware
   */
  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Strict-Transport-Security (HSTS)
      if (this.config.hsts) {
        const hsts = this.buildHSTSHeader(this.config.hsts);
        res.setHeader('Strict-Transport-Security', hsts);
      }

      // Content-Security-Policy
      if (this.config.contentSecurityPolicy) {
        const csp = this.buildCSPHeader(this.config.contentSecurityPolicy.directives || {});
        res.setHeader('Content-Security-Policy', csp);
      }

      // X-Frame-Options
      if (this.config.xFrameOptions) {
        res.setHeader('X-Frame-Options', this.config.xFrameOptions);
      }

      // X-Content-Type-Options
      if (this.config.xContentTypeOptions) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }

      // X-XSS-Protection (legacy but still useful)
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Referrer-Policy
      if (this.config.referrerPolicy) {
        res.setHeader('Referrer-Policy', this.config.referrerPolicy);
      }

      // Permissions-Policy (formerly Feature-Policy)
      if (this.config.permissionsPolicy) {
        const permissionsPolicy = this.buildPermissionsPolicyHeader(
          this.config.permissionsPolicy,
        );
        res.setHeader('Permissions-Policy', permissionsPolicy);
      }

      // X-Permitted-Cross-Domain-Policies
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

      // X-Download-Options (IE)
      res.setHeader('X-Download-Options', 'noopen');

      // Remove X-Powered-By header
      res.removeHeader('X-Powered-By');

      next();
    } catch (error) {
      logger.error('Error applying security headers:', error);
      next(error);
    }
  };

  /**
   * Build HSTS header value
   */
  private buildHSTSHeader(config: NonNullable<SecurityHeadersConfig['hsts']>): string {
    const parts = [`max-age=${config.maxAge || 31536000}`];

    if (config.includeSubDomains) {
      parts.push('includeSubDomains');
    }

    if (config.preload) {
      parts.push('preload');
    }

    return parts.join('; ');
  }

  /**
   * Build CSP header value
   */
  private buildCSPHeader(directives: Record<string, string[]>): string {
    return Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }

  /**
   * Build Permissions-Policy header value
   */
  private buildPermissionsPolicyHeader(policies: Record<string, string[]>): string {
    return Object.entries(policies)
      .map(([feature, allowlist]) => {
        if (allowlist.length === 0) {
          return `${feature}=()`;
        }
        return `${feature}=(${allowlist.join(' ')})`;
      })
      .join(', ');
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SecurityHeadersConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Security headers configuration updated');
  }

  /**
   * Get current configuration
   */
  public getConfig(): SecurityHeadersConfig {
    return { ...this.config };
  }
}

// Create singleton instance with default config
export const securityHeadersMiddleware = new SecurityHeadersMiddleware();

// Export the middleware function
export const applySecurityHeaders = securityHeadersMiddleware.middleware;

