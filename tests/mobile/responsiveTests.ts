/** Mobile Responsiveness Tests */
import { test, devices } from '@playwright/test';
test('mobile responsive', async ({ page }) => {
  await page.setViewportSize(devices['iPhone 12'].viewport);
  await page.goto('/');
  await page.screenshot({ path: 'screenshots/mobile.png' });
});

