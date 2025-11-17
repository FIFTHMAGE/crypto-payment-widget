/** End-to-End Payment Flow Tests */
import { test, expect } from '@playwright/test';
test('complete end-to-end payment flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Make Payment');
  await page.fill('[name="amount"]', '1.0');
  await page.click('button:has-text("Send")');
  await expect(page.locator('.success')).toBeVisible();
});

