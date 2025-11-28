import { type NextFunction, type Request, type Response } from 'express';

import { logger } from '../utils/logger';

import { AppError } from './errorHandler';

export interface ApiKeyData {
  userId: string;
  createdAt: string;
  lastUsed: string | null;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  apiKey?: string;
  apiKeyData?: ApiKeyData;
}

// In-memory API keys storage (use database in production)
const apiKeys = new Map<string, ApiKeyData>();

/**
 * Generate a new API key
 */
export const generateApiKey = (
  userId: string,
  options: Partial<ApiKeyData> = {}
): string => {
  const key = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  apiKeys.set(key, {
    userId,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    permissions: options.permissions || ['read', 'write'],
    rateLimit: options.rateLimit || 1000,
    expiresAt: options.expiresAt,
  });
  return key;
};

/**
 * Validate an API key
 */
export const validateApiKey = (apiKey: string): ApiKeyData | null => {
  const keyData = apiKeys.get(apiKey);

  if (!keyData) {
    return null;
  }

  // Check expiration
  if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
    return null;
  }

  return keyData;
};

/**
 * Revoke an API key
 */
export const revokeApiKey = (apiKey: string): boolean => {
  return apiKeys.delete(apiKey);
};

/**
 * API Key authentication middleware - requires valid API key
 */
export const apiKeyAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    next(new AppError('API key is required', 401));
    return;
  }

  const keyData = validateApiKey(apiKey);

  if (!keyData) {
    logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
    next(new AppError('Invalid API key', 401));
    return;
  }

  // Update last used timestamp
  keyData.lastUsed = new Date().toISOString();

  // Attach authentication info to request
  req.userId = keyData.userId;
  req.apiKey = apiKey;
  req.apiKeyData = keyData;

  next();
};

/**
 * Optional API Key authentication - attaches user info if key is valid
 */
export const optionalApiKeyAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey) {
    const keyData = validateApiKey(apiKey);
    if (keyData) {
      keyData.lastUsed = new Date().toISOString();
      req.userId = keyData.userId;
      req.apiKey = apiKey;
      req.apiKeyData = keyData;
    }
  }

  next();
};

/**
 * Check if user has required permission
 */
export const requirePermission = (permission: string) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.apiKeyData?.permissions?.includes(permission)) {
      next(new AppError(`Missing required permission: ${permission}`, 403));
      return;
    }
    next();
  };
};

export default {
  generateApiKey,
  validateApiKey,
  revokeApiKey,
  apiKeyAuth,
  optionalApiKeyAuth,
  requirePermission,
};

