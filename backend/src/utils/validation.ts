/**
 * Validation utilities - Data validation helpers
 * @module utils
 */

import { ethers } from 'ethers';

export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidEthereumAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  static isValidAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && isFinite(num);
  }

  static isValidChainId(chainId: number): boolean {
    return Number.isInteger(chainId) && chainId > 0;
  }

  static isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  static isValidPercentage(value: number): boolean {
    return value >= 0 && value <= 100;
  }

  static isValidDate(date: string): boolean {
    const timestamp = Date.parse(date);
    return !isNaN(timestamp);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}

