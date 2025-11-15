import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the app', async ({ page }) => {
    await expect(page.getByText('Crypto Payment Widget')).toBeVisible()
  })

  test('should show wallet connect button when not connected', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect/i })
    await expect(connectButton).toBeVisible()
  })

  test('should switch between payment types', async ({ page }) => {
    const simpleButton = page.getByRole('button', { name: /simple payment/i })
    const smartButton = page.getByRole('button', { name: /smart contract/i })

    await simpleButton.click()
    await expect(page.getByText(/direct wallet transfers/i)).toBeVisible()

    await smartButton.click()
    await expect(page.getByText(/escrow payments/i)).toBeVisible()
  })

  test('should display payment features', async ({ page }) => {
    await expect(page.getByText(/payment features/i)).toBeVisible()
    await expect(page.getByText(/simple payment/i)).toBeVisible()
    await expect(page.getByText(/smart contract/i)).toBeVisible()
  })
})

