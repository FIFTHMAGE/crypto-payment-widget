/** Frontend-Backend Integration Tests */
import { describe, it, expect } from 'vitest';
describe('Frontend-Backend Integration', () => {
  it('should fetch payments from API', async () => {
    const response = await fetch('http://localhost:3000/api/v1/payments');
    expect(response.ok).toBe(true);
  });
});

