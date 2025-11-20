/**
 * Crypto utilities - Cryptographic operations
 * @module utils
 */

import crypto from 'crypto';

/**
 * Generate random bytes
 */
export function generateRandomBytes(length: number = 32): Buffer {
  return crypto.randomBytes(length);
}

/**
 * Generate random hex string
 */
export function generateRandomHex(length: number = 32): string {
  return generateRandomBytes(length).toString('hex');
}

/**
 * Generate unique ID
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = generateRandomBytes(6).toString('hex');
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Hash string with SHA256
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash string with SHA512
 */
export function sha512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Generate HMAC signature
 */
export function generateHmac(data: string, secret: string, algorithm: string = 'sha256'): string {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmac(data: string, signature: string, secret: string, algorithm: string = 'sha256'): boolean {
  const expected = generateHmac(data, secret, algorithm);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Encrypt data with AES-256-GCM
 */
export function encrypt(data: string, key: string): { encrypted: string; iv: string; tag: string } {
  const iv = generateRandomBytes(16);
  const keyBuffer = Buffer.from(key, 'hex');
  
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt data with AES-256-GCM
 */
export function decrypt(encrypted: string, key: string, iv: string, tag: string): string {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const tagBuffer = Buffer.from(tag, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate encryption key
 */
export function generateEncryptionKey(): string {
  return generateRandomBytes(32).toString('hex');
}

/**
 * Hash password with salt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const saltBuffer = salt ? Buffer.from(salt, 'hex') : generateRandomBytes(16);
  const hash = crypto.pbkdf2Sync(password, saltBuffer, 100000, 64, 'sha512');
  
  return {
    hash: hash.toString('hex'),
    salt: saltBuffer.toString('hex'),
  };
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(newHash));
}

/**
 * Generate payment ID
 */
export function generatePaymentId(): string {
  return generateUniqueId('pay');
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  return `sk_${generateRandomHex(32)}`;
}

/**
 * Mask sensitive data (show first and last N characters)
 */
export function maskData(data: string, showChars: number = 4): string {
  if (data.length <= showChars * 2) {
    return '*'.repeat(data.length);
  }
  const start = data.substring(0, showChars);
  const end = data.substring(data.length - showChars);
  const masked = '*'.repeat(data.length - showChars * 2);
  return `${start}${masked}${end}`;
}

