/** Visual Regression Tests */
import { test } from '@playwright/test';
test('visual regression for dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await page.screenshot({ path: 'screenshots/dashboard.png' });
});

