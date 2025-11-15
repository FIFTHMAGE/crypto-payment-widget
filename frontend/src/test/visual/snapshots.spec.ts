import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('should match home page snapshot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should match payment form snapshot', async ({ page }) => {
    await page.goto('/')
    const paymentForm = page.locator('form').first()
    await expect(paymentForm).toHaveScreenshot('payment-form.png')
  })

  test('should match wallet connect button snapshot', async ({ page }) => {
    await page.goto('/')
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toHaveScreenshot('connect-button.png')
  })

  test('should match mobile view snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveScreenshot('mobile-home.png', {
      fullPage: true,
    })
  })

  test('should match dark mode snapshot', async ({ page }) => {
    await page.goto('/')
    // Toggle dark mode if implemented
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
    })
  })
})

