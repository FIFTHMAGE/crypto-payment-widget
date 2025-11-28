import { type NextFunction, type Request, type Response } from 'express';

import { AppError } from './errorHandler';

export interface ValidationSchema {
  validate: (data: unknown) => ValidationResult;
}

export interface ValidationResult {
  error?: {
    details: Array<{ message: string; path?: string[]; type?: string }>;
  };
  value?: unknown;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

/**
 * Validate request body against a schema
 */
export const validateRequest = (schema: ValidationSchema, options?: ValidationOptions) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(
        new AppError(message, 400, {
          code: 'VALIDATION_ERROR',
          details: { fields: error.details },
        })
      );
      return;
    }

    // Replace body with validated/transformed value
    if (value) {
      req.body = value;
    }

    next();
  };
};

/**
 * Validate request query parameters
 */
export const validateQueryParams = (allowedParams: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter((key) => !allowedParams.includes(key));

    if (invalidParams.length > 0) {
      next(
        new AppError(`Invalid query parameters: ${invalidParams.join(', ')}`, 400, {
          code: 'INVALID_QUERY_PARAMS',
          details: { invalidParams },
        })
      );
      return;
    }

    next();
  };
};

/**
 * Validate required query parameters are present
 */
export const requireQueryParams = (requiredParams: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const queryKeys = Object.keys(req.query);
    const missingParams = requiredParams.filter((param) => !queryKeys.includes(param));

    if (missingParams.length > 0) {
      next(
        new AppError(`Missing required query parameters: ${missingParams.join(', ')}`, 400, {
          code: 'MISSING_QUERY_PARAMS',
          details: { missingParams },
        })
      );
      return;
    }

    next();
  };
};

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(
        new AppError(message, 400, {
          code: 'INVALID_PARAMS',
          details: { fields: error.details },
        })
      );
      return;
    }

    if (value) {
      req.params = value as Record<string, string>;
    }

    next();
  };
};

/**
 * Validate content type header
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];

    // Skip for methods that typically don't have body
    if (['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    if (!contentType) {
      next(
        new AppError('Content-Type header is required', 400, {
          code: 'MISSING_CONTENT_TYPE',
        })
      );
      return;
    }

    const isAllowed = allowedTypes.some((type) =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      next(
        new AppError(
          `Unsupported Content-Type. Allowed: ${allowedTypes.join(', ')}`,
          415,
          { code: 'UNSUPPORTED_CONTENT_TYPE' }
        )
      );
      return;
    }

    next();
  };
};

export default {
  validateRequest,
  validateQueryParams,
  requireQueryParams,
  validateParams,
  validateContentType,
};

