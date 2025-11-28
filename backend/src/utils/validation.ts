/**
 * Validation utilities
 */

/**
 * Validate an Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate an Ethereum transaction hash
 */
export const isValidTxHash = (txHash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
};

/**
 * Validate a positive amount
 */
export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Validate an email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate a UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = <T>(input: T): T => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim() as T;
};

/**
 * Sanitize an object's string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(sanitized[key] as Record<string, unknown>);
    }
  }
  return sanitized;
};

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Validate and normalize pagination parameters
 */
export const validatePagination = (
  limit?: number | string,
  offset?: number | string,
  options?: { maxLimit?: number; defaultLimit?: number }
): PaginationParams => {
  const { maxLimit = 100, defaultLimit = 50 } = options || {};

  const parsedLimit = parseInt(String(limit || defaultLimit), 10);
  const parsedOffset = parseInt(String(offset || 0), 10);

  return {
    limit: Math.min(Math.max(isNaN(parsedLimit) ? defaultLimit : parsedLimit, 1), maxLimit),
    offset: Math.max(isNaN(parsedOffset) ? 0 : parsedOffset, 0),
  };
};

/**
 * Validate a chain ID
 */
export const isValidChainId = (chainId: number): boolean => {
  const validChainIds = [1, 5, 11155111, 137, 80001, 42161, 10, 56, 43114];
  return validChainIds.includes(chainId);
};

/**
 * Validate a token symbol
 */
export const isValidTokenSymbol = (symbol: string): boolean => {
  return /^[A-Z0-9]{1,11}$/.test(symbol.toUpperCase());
};

/**
 * Validate a private key (without 0x prefix check for flexibility)
 */
export const isValidPrivateKey = (key: string): boolean => {
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
};

/**
 * Validate a block number
 */
export const isValidBlockNumber = (blockNumber: number | string): boolean => {
  const num = typeof blockNumber === 'number' ? blockNumber : parseInt(blockNumber, 10);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * Validate required fields in an object
 */
export const validateRequired = <T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(String(field));
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Validate a date string
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate a timestamp (in milliseconds)
 */
export const isValidTimestamp = (timestamp: number): boolean => {
  const minTimestamp = 0; // 1970-01-01
  const maxTimestamp = 4102444800000; // 2100-01-01
  return timestamp >= minTimestamp && timestamp <= maxTimestamp;
};

export default {
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
};
