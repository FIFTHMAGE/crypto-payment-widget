/**
 * Validators - Input validation utilities
 * @module utils
 */

import { ethers } from 'ethers';

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate amount
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate timestamp
 */
export function isValidTimestamp(timestamp: number): boolean {
  return Number.isInteger(timestamp) && timestamp > 0 && timestamp < Date.now() * 2;
}

/**
 * Validate payment ID format
 */
export function isValidPaymentId(id: string): boolean {
  return /^pay_[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Validate and parse JSON
 */
export function validateJson(jsonString: string): { valid: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    return { valid: true, data };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: number,
  limit: number
): { valid: boolean; error?: string } {
  if (!Number.isInteger(page) || page < 1) {
    return { valid: false, error: 'Page must be a positive integer' };
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { valid: false, error: 'Limit must be between 1 and 100' };
  }
  return { valid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  fromDate: Date | string,
  toDate: Date | string
): { valid: boolean; error?: string } {
  const from = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
  const to = typeof toDate === 'string' ? new Date(toDate) : toDate;

  if (isNaN(from.getTime())) {
    return { valid: false, error: 'Invalid from date' };
  }
  if (isNaN(to.getTime())) {
    return { valid: false, error: 'Invalid to date' };
  }
  if (from > to) {
    return { valid: false, error: 'From date must be before to date' };
  }
  return { valid: true };
}

/**
 * Validate token address (ERC20)
 */
export function isValidTokenAddress(address: string, allowNative: boolean = true): boolean {
  if (allowNative && (address === '0x0' || address === ethers.ZeroAddress)) {
    return true;
  }
  return isValidAddress(address);
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validate basis points (0-10000)
 */
export function isValidBasisPoints(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 10000;
}

