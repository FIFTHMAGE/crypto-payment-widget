/**
 * Utils module - Central export for all utilities
 */

// Logger
export { logger } from './logger';
export type { LogLevel } from './logger';

// Response formatter
export {
  formatSuccess,
  successResponse,
  formatError,
  errorResponse,
  formatPagination,
  paginatedResponse,
  createPaginationMeta,
  formatList,
} from './responseFormatter';
export type {
  SuccessResponse,
  ErrorResponse,
  PaginationMeta,
  PaginatedResponse,
} from './responseFormatter';

// Validation
export {
  isValidAddress,
  isValidTxHash,
  isValidAmount,
  isValidEmail,
  isValidUrl,
  isValidUUID,
  sanitizeInput,
  sanitizeObject,
  validatePagination,
  isValidChainId,
  isValidTokenSymbol,
  isValidPrivateKey,
  isValidBlockNumber,
  validateRequired,
  isValidDate,
  isValidTimestamp,
} from './validation';
export type { PaginationParams } from './validation';

// Helpers
export {
  sleep,
  retry,
  parseJSON,
  chunk,
  debounce,
  throttle,
  formatCurrency,
  generateId,
  generateUUID as generateUniqueId,
  deepClone,
  omit,
  pick,
  isEmpty,
  capitalize,
  camelCase,
  snakeCase,
} from './helpers';
export type { RetryOptions } from './helpers';

// Crypto
export {
  generateApiKey,
  generatePrefixedApiKey,
  hashPassword,
  sha256,
  sha512,
  verifySignature,
  createSignature,
  generateNonce,
  createHmac,
  verifyHmac,
  encrypt,
  decrypt,
  generateEncryptionKey,
  deriveKey,
  generateSalt,
  constantTimeCompare,
} from './crypto';

