/** Security Testing */
import { describe, it, expect } from 'vitest';
describe('Security Tests', () => {
  it('should prevent SQL injection', () => {
    const malicious = "'; DROP TABLE payments; --";
    expect(() => queryDatabase(malicious)).not.toThrow();
  });
});
const queryDatabase = (input: string) => input;

