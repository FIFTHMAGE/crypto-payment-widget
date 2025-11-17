/** Smoke Tests */
import { test, expect } from '@playwright/test';
test('API is accessible', async () => {
  const response = await fetch('http://localhost:3000/health');
  expect(response.ok).toBe(true);
});

