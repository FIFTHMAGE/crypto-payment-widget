import { randomUUID } from 'crypto';
import { type NextFunction, type Request, type Response } from 'express';

export interface RequestWithId extends Request {
  id?: string;
  requestTime?: number;
}

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  return randomUUID();
};

/**
 * Request ID middleware - attaches a unique ID to each request
 */
export const requestId = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  // Use existing ID from header or generate a new one
  const id =
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    generateRequestId();

  // Attach to request object
  req.id = id;
  req.requestTime = Date.now();

  // Set response headers
  res.setHeader('X-Request-ID', id);

  next();
};

/**
 * Get the request ID from a request object
 */
export const getRequestId = (req: RequestWithId): string | undefined => {
  return req.id;
};

export default requestId;

