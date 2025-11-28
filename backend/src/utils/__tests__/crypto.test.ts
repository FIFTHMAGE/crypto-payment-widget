import { describe, expect, it } from 'vitest';

import {
  createHmac,
  generateApiKey,
  generateNonce,
  hashPassword,
  verifyHmac,
  verifySignature,
} from '../crypto';

describe('Crypto Utils', () => {
  describe('hashPassword', () => {
    it('should hash data', async () => {
      const data = 'test-password';
      const hashed = await hashPassword(data);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
    });

    it('should produce consistent hashes with same salt', async () => {
      const data = 'test-password';
      const salt = 'fixed-salt';
      const hash1 = await hashPassword(data, salt);
      const hash2 = await hashPassword(data, salt);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes with different salts', async () => {
      const data = 'test-password';
      const hash1 = await hashPassword(data, 'salt1');
      const hash2 = await hashPassword(data, 'salt2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce hex string output', async () => {
      const hashed = await hashPassword('test');
      expect(/^[a-f0-9]+$/i.test(hashed)).toBe(true);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const data = 'test-data';
      const secret = 'test-secret';
      const signature = createHmac(data, secret);

      const isValid = verifySignature(data, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const data = 'test-data';
      const secret = 'test-secret';

      const isValid = verifySignature(data, 'invalid-signature', secret);

      expect(isValid).toBe(false);
    });

    it('should reject tampered data', () => {
      const data = 'test-data';
      const secret = 'test-secret';
      const signature = createHmac(data, secret);

      const isValid = verifySignature('tampered-data', signature, secret);

      expect(isValid).toBe(false);
    });
  });

  describe('generateApiKey', () => {
    it('should generate random API keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
    });

    it('should generate keys with default length', () => {
      const key = generateApiKey();
      // Default 32 bytes = 64 hex chars + possible prefix
      expect(key.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate keys with custom length', () => {
      const key = generateApiKey(16);
      // 16 bytes = 32 hex characters
      expect(key.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate URL-safe keys', () => {
      const key = generateApiKey();
      // Should not contain characters that need URL encoding
      expect(/^[a-zA-Z0-9_-]+$/.test(key)).toBe(true);
    });

    it('should include prefix if specified', () => {
      const key = generateApiKey(32, 'sk_');
      expect(key.startsWith('sk_')).toBe(true);
    });
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonces of specified length', () => {
      const nonce = generateNonce(24);
      // 24 bytes = 48 hex characters
      expect(nonce.length).toBe(48);
    });

    it('should generate hex string', () => {
      const nonce = generateNonce();
      expect(/^[a-f0-9]+$/i.test(nonce)).toBe(true);
    });
  });

  describe('createHmac', () => {
    it('should create HMAC for data', () => {
      const hmac = createHmac('test-data', 'secret');

      expect(hmac).toBeDefined();
      expect(hmac.length).toBeGreaterThan(0);
    });

    it('should produce consistent HMACs', () => {
      const hmac1 = createHmac('test-data', 'secret');
      const hmac2 = createHmac('test-data', 'secret');

      expect(hmac1).toBe(hmac2);
    });

    it('should produce different HMACs for different data', () => {
      const hmac1 = createHmac('data1', 'secret');
      const hmac2 = createHmac('data2', 'secret');

      expect(hmac1).not.toBe(hmac2);
    });

    it('should produce different HMACs for different secrets', () => {
      const hmac1 = createHmac('data', 'secret1');
      const hmac2 = createHmac('data', 'secret2');

      expect(hmac1).not.toBe(hmac2);
    });

    it('should handle empty data', () => {
      const hmac = createHmac('', 'secret');
      expect(hmac).toBeDefined();
    });
  });

  describe('verifyHmac', () => {
    it('should verify valid HMAC', () => {
      const data = 'test-data';
      const secret = 'secret';
      const hmac = createHmac(data, secret);

      expect(verifyHmac(data, hmac, secret)).toBe(true);
    });

    it('should reject invalid HMAC', () => {
      expect(verifyHmac('data', 'invalid', 'secret')).toBe(false);
    });

    it('should be timing-safe', () => {
      const data = 'test-data';
      const secret = 'secret';
      const hmac = createHmac(data, secret);

      // Multiple verifications should take similar time
      // This is a basic check; true timing tests require more sophisticated methods
      const start1 = performance.now();
      verifyHmac(data, hmac, secret);
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      verifyHmac(data, 'x'.repeat(hmac.length), secret);
      const time2 = performance.now() - start2;

      // Times should be in same order of magnitude
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });
  });
});

