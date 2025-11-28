import { type NextFunction, type Request, type Response } from 'express';

import { logger } from '../utils/logger';

export type ErrorStatus = 'fail' | 'error';

export interface AppErrorOptions {
  isOperational?: boolean;
  cause?: Error;
  code?: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: ErrorStatus;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    options: AppErrorOptions = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = options.isOperational ?? true;
    this.code = options.code;
    this.details = options.details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      code: this.code,
      details: this.details,
    };
  }
}

export interface ValidationErrorItem {
  message: string;
  path?: string;
  value?: unknown;
}

export interface MongooseError extends Error {
  code?: number;
  errors?: Record<string, ValidationErrorItem>;
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError | MongooseError,
  req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(err.message, 500, { isOperational: false });
  }

  // Log error
  logger.error({
    message: error.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode,
    code: error.code,
  });

  // Handle specific error types
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404, { code: 'RESOURCE_NOT_FOUND' });
  }

  // Handle MongoDB duplicate key error
  if ('code' in err && err.code === 11000) {
    error = new AppError('Duplicate field value entered', 400, { code: 'DUPLICATE_KEY' });
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError' && 'errors' in err && err.errors) {
    const messages = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = new AppError(messages, 400, { code: 'VALIDATION_ERROR' });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, { code: 'INVALID_TOKEN' });
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, { code: 'TOKEN_EXPIRED' });
  }

  // Handle syntax errors in JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    error = new AppError('Invalid JSON in request body', 400, { code: 'INVALID_JSON' });
  }

  const response: ErrorResponse = {
    success: false,
    error: error.message || 'Server Error',
    code: error.code,
    details: error.details,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, {
    code: 'NOT_FOUND',
  });
  next(error);
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
};
