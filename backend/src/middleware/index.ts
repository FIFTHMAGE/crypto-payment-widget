/**
 * Middleware module - Central export for all middleware
 */

// Error handling
export { AppError, errorHandler, notFound, asyncHandler } from './errorHandler';
export type { ErrorStatus, AppErrorOptions, MongooseError } from './errorHandler';

// Rate limiting
export { rateLimiter, createRateLimiter, getRateLimitInfo, resetRateLimit } from './rateLimiter';
export type { RateLimitOptions, RateLimitInfo } from './rateLimiter';

// Security headers
export { securityHeaders, createSecurityHeaders } from './securityHeaders';
export type { SecurityHeadersOptions } from './securityHeaders';

// Request logging
export { requestLogger, createRequestLogger } from './requestLogger';
export type { RequestLogOptions } from './requestLogger';

// Request validation
export {
  validateRequest,
  validateQueryParams,
  requireQueryParams,
  validateParams,
  validateContentType,
} from './validateRequest';
export type { ValidationSchema, ValidationResult, ValidationOptions } from './validateRequest';

// API key authentication
export {
  apiKeyAuth,
  optionalApiKeyAuth,
  generateApiKey,
  validateApiKey,
  revokeApiKey,
  requirePermission,
} from './apiKeyAuth';
export type { ApiKeyData, AuthenticatedRequest } from './apiKeyAuth';

// Request ID
export { requestId, getRequestId } from './requestId';
export type { RequestWithId } from './requestId';

// Timeout
export { timeoutMiddleware, createTimeoutMiddleware, withTimeout } from './timeout';
export type { TimeoutOptions } from './timeout';

// Compression
export { compressionMiddleware, getCompressionStats } from './compression';
export type { CompressionOptions } from './compression';

// Re-export existing TypeScript middleware if they exist
export * from './auth.middleware';
export * from './error.middleware';
export * from './validation.middleware';

