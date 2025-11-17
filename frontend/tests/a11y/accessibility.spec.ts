/** Accessibility Tests */
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
test('payment page accessibility', async ({ page }) => {
  await page.goto('/payment');
  await injectAxe(page);
  await checkA11y(page);
});

