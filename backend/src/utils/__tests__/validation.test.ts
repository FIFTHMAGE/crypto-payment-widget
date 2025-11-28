import { describe, expect, it } from 'vitest';

import {
  isValidAddress,
  isValidAmount,
  isValidTxHash,
  sanitizeInput,
  validatePagination,
} from '../validation';

describe('Validation Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct ethereum address', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(true);
    });

    it('should validate lowercase address', () => {
      expect(isValidAddress('0x742d35cc6634c0532925a3b844bc9e7595f0beb9')).toBe(true);
    });

    it('should validate uppercase address', () => {
      expect(isValidAddress('0x742D35CC6634C0532925A3B844BC9E7595F0BEB9')).toBe(true);
    });

    it('should reject address without 0x prefix', () => {
      expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(false);
    });

    it('should reject short addresses', () => {
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0b')).toBe(false);
    });

    it('should reject long addresses', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9aa')).toBe(false);
    });

    it('should reject invalid characters', () => {
      expect(isValidAddress('0x742d35Gg6634C0532925a3b844Bc9e7595f0bEb9')).toBe(false);
      expect(isValidAddress('0x742d35 C6634C0532925a3b844Bc9e7595f0bEb9')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidAddress('')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidAddress(null as unknown as string)).toBe(false);
      expect(isValidAddress(undefined as unknown as string)).toBe(false);
    });
  });

  describe('isValidTxHash', () => {
    it('should validate correct transaction hash', () => {
      const hash = '0x742d35cc6634c0532925a3b844bc9e7595f0beb9742d35cc6634c0532925a3b8';
      expect(isValidTxHash(hash)).toBe(true);
    });

    it('should validate uppercase hash', () => {
      const hash = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB9742D35CC6634C0532925A3B8';
      expect(isValidTxHash(hash)).toBe(true);
    });

    it('should reject short hashes', () => {
      expect(isValidTxHash('0x123')).toBe(false);
      expect(isValidTxHash('0x742d35cc6634c0532925a3b844bc9e7595f0beb97')).toBe(false);
    });

    it('should reject hash without 0x prefix', () => {
      const hash = '742d35cc6634c0532925a3b844bc9e7595f0beb9742d35cc6634c0532925a3b8';
      expect(isValidTxHash(hash)).toBe(false);
    });

    it('should reject invalid characters', () => {
      const hash = '0xzzzz35cc6634c0532925a3b844bc9e7595f0beb9742d35cc6634c0532925a3b8';
      expect(isValidTxHash(hash)).toBe(false);
    });

    it('should reject empty/null/undefined', () => {
      expect(isValidTxHash('')).toBe(false);
      expect(isValidTxHash(null as unknown as string)).toBe(false);
      expect(isValidTxHash(undefined as unknown as string)).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive integers', () => {
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('1')).toBe(true);
      expect(isValidAmount('999999999')).toBe(true);
    });

    it('should validate positive decimals', () => {
      expect(isValidAmount('1.5')).toBe(true);
      expect(isValidAmount('0.001')).toBe(true);
      expect(isValidAmount('0.000000000000000001')).toBe(true);
    });

    it('should validate zero', () => {
      expect(isValidAmount('0')).toBe(true);
      expect(isValidAmount('0.0')).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount('-0.5')).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('1a2b')).toBe(false);
      expect(isValidAmount('$100')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidAmount('')).toBe(false);
    });

    it('should handle scientific notation', () => {
      expect(isValidAmount('1e18')).toBe(true);
      expect(isValidAmount('1.5e10')).toBe(true);
    });

    it('should reject NaN and Infinity', () => {
      expect(isValidAmount('NaN')).toBe(false);
      expect(isValidAmount('Infinity')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should remove HTML tags', () => {
      const input = '<div><b>bold</b></div>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<div>');
      expect(sanitized).not.toContain('<b>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
      expect(sanitizeInput('\t\ntest\n\t')).toBe('test');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
    });

    it('should escape SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain("'");
    });

    it('should handle unicode characters', () => {
      expect(sanitizeInput('Hello 世界')).toContain('世界');
    });
  });

  describe('validatePagination', () => {
    it('should return default values for missing params', () => {
      const result = validatePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should parse valid page and limit', () => {
      const result = validatePagination({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should enforce minimum values', () => {
      const result = validatePagination({ page: '0', limit: '0' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = validatePagination({ page: '1', limit: '1000' });
      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('should handle invalid values', () => {
      const result = validatePagination({ page: 'abc', limit: 'xyz' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should calculate offset correctly', () => {
      const result1 = validatePagination({ page: '1', limit: '10' });
      expect(result1.offset).toBe(0);

      const result2 = validatePagination({ page: '2', limit: '10' });
      expect(result2.offset).toBe(10);

      const result3 = validatePagination({ page: '3', limit: '20' });
      expect(result3.offset).toBe(40);
    });
  });
});

