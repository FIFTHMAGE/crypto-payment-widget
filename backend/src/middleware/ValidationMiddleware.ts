/**
 * ValidationMiddleware - Request validation middleware
 * @module middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Create validation middleware from Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);

      // Replace request data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Request validation failed',
          errors,
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation processing failed',
      });
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Ethereum address
  ethereumAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
    .transform((val) => val.toLowerCase()),

  // Transaction hash
  transactionHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')
    .transform((val) => val.toLowerCase()),

  // Amount (positive number as string)
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'Amount must be a positive number' }
  ),

  // Token address or native token
  token: z
    .string()
    .refine(
      (val) => val === 'native' || /^0x[a-fA-F0-9]{40}$/.test(val),
      'Invalid token address'
    )
    .transform((val) => (val === 'native' ? val : val.toLowerCase())),

  // UUID
  uuid: z.string().uuid('Invalid UUID'),

  // Email
  email: z.string().email('Invalid email address'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

/**
 * Payment validation schemas
 */
export const paymentSchemas = {
  createPayment: z.object({
    payeeAddress: commonSchemas.ethereumAddress,
    token: commonSchemas.token,
    amount: commonSchemas.amount,
    metadata: z.record(z.any()).optional(),
  }),

  createEscrow: z.object({
    payeeAddress: commonSchemas.ethereumAddress,
    token: commonSchemas.token,
    amount: commonSchemas.amount,
    releaseTime: z.number().int().min(Date.now()),
    metadata: z.record(z.any()).optional(),
  }),

  splitPayment: z.object({
    recipients: z.array(commonSchemas.ethereumAddress).min(1).max(10),
    amounts: z.array(commonSchemas.amount).min(1).max(10),
    token: commonSchemas.token,
    metadata: z.record(z.any()).optional(),
  }),

  releaseEscrow: z.object({
    escrowId: z.string().min(1),
  }),

  refundEscrow: z.object({
    escrowId: z.string().min(1),
    reason: z.string().optional(),
  }),
};

/**
 * Validate payment creation
 */
export const validateCreatePayment = validate(paymentSchemas.createPayment);

/**
 * Validate escrow creation
 */
export const validateCreateEscrow = validate(paymentSchemas.createEscrow);

/**
 * Validate split payment
 */
export const validateSplitPayment = validate(paymentSchemas.splitPayment);

/**
 * Sanitize input to prevent XSS
 */
export function sanitize(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate array length
 */
export function validateArrayLength(min: number, max: number, field: string = 'items') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const array = req.body[field];

    if (!Array.isArray(array)) {
      res.status(400).json({
        error: 'Validation Error',
        message: `${field} must be an array`,
      });
      return;
    }

    if (array.length < min || array.length > max) {
      res.status(400).json({
        error: 'Validation Error',
        message: `${field} must contain between ${min} and ${max} items`,
      });
      return;
    }

    next();
  };
}

/**
 * Validate required fields
 */
export function validateRequired(...fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of fields) {
      if (!req.body[field]) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields',
        missing,
      });
      return;
    }

    next();
  };
}

/**
 * Validate field format
 */
export function validateFormat(field: string, pattern: RegExp, message?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[field];

    if (!value) {
      next();
      return;
    }

    if (!pattern.test(value)) {
      res.status(400).json({
        error: 'Validation Error',
        message: message || `Invalid format for ${field}`,
        field,
      });
      return;
    }

    next();
  };
}

/**
 * Validate numeric range
 */
export function validateRange(
  field: string,
  min: number,
  max: number,
  type: 'integer' | 'float' = 'float'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[field];

    if (value === undefined || value === null) {
      next();
      return;
    }

    const num = type === 'integer' ? parseInt(value, 10) : parseFloat(value);

    if (isNaN(num)) {
      res.status(400).json({
        error: 'Validation Error',
        message: `${field} must be a ${type}`,
        field,
      });
      return;
    }

    if (num < min || num > max) {
      res.status(400).json({
        error: 'Validation Error',
        message: `${field} must be between ${min} and ${max}`,
        field,
      });
      return;
    }

    next();
  };
}

/**
 * Validate enum values
 */
export function validateEnum(field: string, allowedValues: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[field];

    if (!value) {
      next();
      return;
    }

    if (!allowedValues.includes(value)) {
      res.status(400).json({
        error: 'Validation Error',
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
        field,
        allowedValues,
      });
      return;
    }

    next();
  };
}

/**
 * Validate custom condition
 */
export function validateCustom(
  validator: (req: Request) => Promise<{ valid: boolean; message?: string }> | {
    valid: boolean;
    message?: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await validator(req);

      if (!result.valid) {
        res.status(400).json({
          error: 'Validation Error',
          message: result.message || 'Validation failed',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation processing failed',
      });
    }
  };
}

