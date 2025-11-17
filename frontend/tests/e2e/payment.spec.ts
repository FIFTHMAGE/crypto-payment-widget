/** E2E Payment Tests */
import { test, expect } from '@playwright/test';
test('complete payment flow', async ({ page }) => {
  await page.goto('/payment');
  await page.fill('[name="amount"]', '1.0');
  await page.fill('[name="address"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});

