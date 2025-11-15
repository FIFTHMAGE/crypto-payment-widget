import { test, expect } from '@playwright/test'

test.describe('Wallet Connection E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display wallet connect button', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeVisible()
  })

  test('should display app title', async ({ page }) => {
    const title = page.getByRole('heading', { name: /crypto payment widget/i })
    await expect(title).toBeVisible()
  })

  test('should display payment type selector', async ({ page }) => {
    const simpleButton = page.getByRole('button', { name: /simple payment/i })
    const smartButton = page.getByRole('button', { name: /smart contract/i })
    await expect(simpleButton).toBeVisible()
    await expect(smartButton).toBeVisible()
  })

  test('should switch between payment types', async ({ page }) => {
    const smartButton = page.getByRole('button', { name: /smart contract/i })
    await smartButton.click()
    // Verify smart contract payment form is displayed
    await expect(page.getByText(/escrow/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const title = page.getByRole('heading', { name: /crypto payment widget/i })
    await expect(title).toBeVisible()
  })
})

