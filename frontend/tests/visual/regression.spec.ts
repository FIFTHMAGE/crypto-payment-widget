/** Visual Regression Tests */
import { test } from '@playwright/test';
test('payment page screenshot', async ({ page }) => {
  await page.goto('/payment');
  await page.screenshot({ path: 'screenshots/payment.png', fullPage: true });
});

