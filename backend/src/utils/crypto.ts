/**
 * Crypto utilities - Encryption and hashing
 * @module utils
 */

import crypto from 'crypto';

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;
  private static readonly TAG_LENGTH = 16;

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const finalSalt = salt || crypto.randomBytes(this.SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(password, finalSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: finalSalt };
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  static encrypt(text: string, secretKey: string): string {
    const key = crypto.scryptSync(secretKey, 'salt', this.KEY_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  static decrypt(encryptedText: string, secretKey: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const key = crypto.scryptSync(secretKey, 'salt', this.KEY_LENGTH);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  static verifyHmac(data: string, signature: string, secret: string): boolean {
    const computedSignature = this.hmac(data, secret);
    return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature));
  }
}
