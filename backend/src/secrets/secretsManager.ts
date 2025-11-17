/** Secrets Manager */
export class SecretsManager {
  private secrets = new Map<string, string>();
  set(key: string, value: string) { this.secrets.set(key, value); }
  get(key: string): string | undefined { return this.secrets.get(key); }
  has(key: string): boolean { return this.secrets.has(key); }
}
export const secrets = new SecretsManager();

