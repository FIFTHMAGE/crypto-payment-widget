/**
 * Cryptographic utilities
 */
import crypto from 'crypto';

/**
 * Generate a random API key
 */
export const generateApiKey = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a prefixed API key (e.g., sk_live_...)
 */
export const generatePrefixedApiKey = (prefix = 'sk', environment = 'live'): string => {
  const key = crypto.randomBytes(24).toString('base64url');
  return `${prefix}_${environment}_${key}`;
};

/**
 * Hash a password using SHA-256 (use bcrypt in production)
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Hash data using SHA-256
 */
export const sha256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Hash data using SHA-512
 */
export const sha512 = (data: string): string => {
  return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Verify an RSA signature
 */
export const verifySignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(message);
    return verify.verify(publicKey, signature, 'hex');
  } catch {
    return false;
  }
};

/**
 * Create an RSA signature
 */
export const createSignature = (
  message: string,
  privateKey: string
): string => {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  return sign.sign(privateKey, 'hex');
};

/**
 * Generate a random nonce
 */
export const generateNonce = (bytes = 16): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Create an HMAC signature
 */
export const createHmac = (
  data: unknown,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): string => {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHmac(algorithm, secret).update(stringData).digest('hex');
};

/**
 * Verify an HMAC signature (timing-safe)
 */
export const verifyHmac = (
  data: unknown,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean => {
  try {
    const expected = createHmac(data, secret, algorithm);
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
};

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = (
  data: string,
  key: string
): { encrypted: string; iv: string; tag: string } => {
  const iv = crypto.randomBytes(12);
  const keyBuffer = Buffer.from(key, 'hex').subarray(0, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = (
  encrypted: string,
  key: string,
  iv: string,
  tag: string
): string => {
  const keyBuffer = Buffer.from(key, 'hex').subarray(0, 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    keyBuffer,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Generate a random encryption key
 */
export const generateEncryptionKey = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Derive a key from a password using PBKDF2
 */
export const deriveKey = (
  password: string,
  salt: string,
  iterations = 100000,
  keyLength = 32
): string => {
  return crypto
    .pbkdf2Sync(password, salt, iterations, keyLength, 'sha256')
    .toString('hex');
};

/**
 * Generate a random salt
 */
export const generateSalt = (bytes = 16): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Constant-time string comparison
 */
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export default {
  generateApiKey,
  generatePrefixedApiKey,
  hashPassword,
  sha256,
  sha512,
  verifySignature,
  createSignature,
  generateNonce,
  generateUUID,
  createHmac,
  verifyHmac,
  encrypt,
  decrypt,
  generateEncryptionKey,
  deriveKey,
  generateSalt,
  constantTimeCompare,
};
