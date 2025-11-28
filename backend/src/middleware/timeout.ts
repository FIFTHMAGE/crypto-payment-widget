import { type NextFunction, type Request, type Response } from 'express';

import { AppError } from './errorHandler';

export interface TimeoutOptions {
  duration?: number;
  message?: string;
  statusCode?: number;
  onTimeout?: (req: Request, res: Response) => void;
}

/**
 * Create timeout middleware with options
 */
export const createTimeoutMiddleware = (options: TimeoutOptions = {}) => {
  const {
    duration = 30000,
    message = 'Request timeout',
    statusCode = 408,
    onTimeout,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;

      if (onTimeout) {
        onTimeout(req, res);
      } else {
        next(new AppError(message, statusCode, { code: 'REQUEST_TIMEOUT' }));
      }
    }, duration);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    // Clear timeout when connection closes
    res.on('close', () => {
      clearTimeout(timeout);
    });

    // Override res.json to check for timeout
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown): Response {
      if (timedOut) {
        return res;
      }
      return originalJson(body);
    };

    // Override res.send to check for timeout
    const originalSend = res.send.bind(res);
    res.send = function (body: unknown): Response {
      if (timedOut) {
        return res;
      }
      return originalSend(body);
    };

    next();
  };
};

/**
 * Simple timeout middleware with default options
 */
export const timeoutMiddleware = (duration = 30000) => {
  return createTimeoutMiddleware({ duration });
};

/**
 * Route-specific timeout decorator
 */
export const withTimeout = (duration: number) => {
  return createTimeoutMiddleware({ duration });
};

export default timeoutMiddleware;

