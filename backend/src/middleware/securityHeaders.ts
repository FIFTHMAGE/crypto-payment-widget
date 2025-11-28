import { type NextFunction, type Request, type Response } from 'express';

export interface SecurityHeadersOptions {
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions?: boolean;
  xssProtection?: boolean;
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  contentSecurityPolicy?: string | false;
  strictTransportSecurity?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  } | false;
  permissionsPolicy?: string | false;
  crossOriginEmbedderPolicy?: 'require-corp' | 'credentialless' | false;
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none' | false;
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin' | false;
}

const DEFAULT_CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self'; " +
  "connect-src 'self' https:; " +
  "frame-ancestors 'none';";

/**
 * Create security headers middleware with options
 */
export const createSecurityHeaders = (options: SecurityHeadersOptions = {}) => {
  const {
    frameOptions = 'DENY',
    contentTypeOptions = true,
    xssProtection = true,
    referrerPolicy = 'strict-origin-when-cross-origin',
    contentSecurityPolicy = DEFAULT_CSP,
    strictTransportSecurity = { maxAge: 31536000, includeSubDomains: true },
    permissionsPolicy = 'geolocation=(), microphone=(), camera=()',
    crossOriginEmbedderPolicy = false,
    crossOriginOpenerPolicy = 'same-origin',
    crossOriginResourcePolicy = 'same-origin',
  } = options;

  return (_req: Request, res: Response, next: NextFunction): void => {
    // Prevent clickjacking
    if (frameOptions) {
      res.setHeader('X-Frame-Options', frameOptions);
    }

    // Prevent MIME type sniffing
    if (contentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // XSS Protection (legacy, but still useful)
    if (xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // Referrer Policy
    if (referrerPolicy) {
      res.setHeader('Referrer-Policy', referrerPolicy);
    }

    // Content Security Policy
    if (contentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', contentSecurityPolicy);
    }

    // HTTP Strict Transport Security (HSTS)
    if (strictTransportSecurity) {
      let hstsValue = `max-age=${strictTransportSecurity.maxAge}`;
      if (strictTransportSecurity.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (strictTransportSecurity.preload) {
        hstsValue += '; preload';
      }
      res.setHeader('Strict-Transport-Security', hstsValue);
    }

    // Permissions Policy
    if (permissionsPolicy) {
      res.setHeader('Permissions-Policy', permissionsPolicy);
    }

    // Cross-Origin Embedder Policy
    if (crossOriginEmbedderPolicy) {
      res.setHeader('Cross-Origin-Embedder-Policy', crossOriginEmbedderPolicy);
    }

    // Cross-Origin Opener Policy
    if (crossOriginOpenerPolicy) {
      res.setHeader('Cross-Origin-Opener-Policy', crossOriginOpenerPolicy);
    }

    // Cross-Origin Resource Policy
    if (crossOriginResourcePolicy) {
      res.setHeader('Cross-Origin-Resource-Policy', crossOriginResourcePolicy);
    }

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    next();
  };
};

// Default security headers middleware
export const securityHeaders = createSecurityHeaders();

export default securityHeaders;

