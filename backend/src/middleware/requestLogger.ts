import { type NextFunction, type Request, type Response } from 'express';

import { logger } from '../utils/logger';

import { type RequestWithId } from './requestId';

export interface RequestLogOptions {
  logBody?: boolean;
  logHeaders?: boolean;
  sensitiveHeaders?: string[];
  skipPaths?: string[];
}

const DEFAULT_SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'cookie',
  'set-cookie',
];

/**
 * Create request logger middleware with options
 */
export const createRequestLogger = (options: RequestLogOptions = {}) => {
  const {
    logBody = false,
    logHeaders = false,
    sensitiveHeaders = DEFAULT_SENSITIVE_HEADERS,
    skipPaths = ['/health', '/ready', '/metrics'],
  } = options;

  return (req: RequestWithId, res: Response, next: NextFunction): void => {
    // Skip logging for certain paths
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      next();
      return;
    }

    const start = Date.now();

    // Capture original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    let responseBody: unknown;

    if (logBody) {
      res.json = function (body: unknown): Response {
        responseBody = body;
        return originalJson(body);
      };

      res.send = function (body: unknown): Response {
        responseBody = body;
        return originalSend(body);
      };
    }

    res.on('finish', () => {
      const duration = Date.now() - start;
      const contentLength = res.getHeader('content-length');

      const logData: Record<string, unknown> = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        contentLength,
        ip:
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          req.ip,
        userAgent: req.headers['user-agent'],
      };

      // Add headers if enabled (sanitize sensitive ones)
      if (logHeaders) {
        const sanitizedHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (sensitiveHeaders.includes(key.toLowerCase())) {
            sanitizedHeaders[key] = '[REDACTED]';
          } else if (typeof value === 'string') {
            sanitizedHeaders[key] = value;
          } else if (Array.isArray(value)) {
            sanitizedHeaders[key] = value.join(', ');
          }
        }
        logData.headers = sanitizedHeaders;
      }

      // Add request body if enabled
      if (logBody && req.body && Object.keys(req.body).length > 0) {
        logData.requestBody = sanitizeBody(req.body);
      }

      // Add response body if enabled (only for errors)
      if (logBody && responseBody && res.statusCode >= 400) {
        logData.responseBody = responseBody;
      }

      // Log at appropriate level based on status code
      if (res.statusCode >= 500) {
        logger.error(logData);
      } else if (res.statusCode >= 400) {
        logger.warn(logData);
      } else {
        logger.info(logData);
      }
    });

    next();
  };
};

/**
 * Sanitize sensitive fields from request body
 */
const sanitizeBody = (body: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Default request logger
export const requestLogger = createRequestLogger();

export default requestLogger;

