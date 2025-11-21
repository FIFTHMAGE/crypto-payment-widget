/**
 * JWT utilities - Token generation and verification
 * @module utils
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/environment';

export interface JwtPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

export class JwtUtil {
  private static readonly SECRET = env.JWT_SECRET;
  private static readonly EXPIRY = '24h';

  static sign(payload: JwtPayload, expiresIn: string = this.EXPIRY): string {
    return jwt.sign(payload, this.SECRET, { expiresIn });
  }

  static verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  static refresh(token: string): string {
    const payload = this.verify(token);
    const { iat, exp, ...rest } = payload as any;
    return this.sign(rest);
  }
}

