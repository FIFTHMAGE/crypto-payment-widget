/** API Key Management */
import { randomBytes } from 'crypto';
export class ApiKeyManager {
  private keys = new Map<string, { userId: string; permissions: string[] }>();
  
  generate(userId: string, permissions: string[] = []) {
    const key = `pk_${randomBytes(32).toString('hex')}`;
    this.keys.set(key, { userId, permissions });
    return key;
  }
  
  validate(key: string) { return this.keys.has(key); }
  getPermissions(key: string) { return this.keys.get(key)?.permissions || []; }
}

