import { test, expect } from '@playwright/test'

test.describe('Payment Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display payment form fields', async ({ page }) => {
    await expect(page.getByPlaceholderText(/recipient address/i)).toBeVisible()
    await expect(page.getByPlaceholderText(/amount/i)).toBeVisible()
  })

  test('should validate recipient address format', async ({ page }) => {
    const input = page.getByPlaceholderText(/recipient address/i)
    await input.fill('invalid-address')
    await input.blur()
    // Should show validation error
    await expect(page.getByText(/invalid.*address/i)).toBeVisible()
  })

  test('should validate amount is positive', async ({ page }) => {
    const input = page.getByPlaceholderText(/amount/i)
    await input.fill('-1')
    await input.blur()
    await expect(page.getByText(/must be.*positive/i)).toBeVisible()
  })

  test('should enable send button when form is valid', async ({ page }) => {
    const addressInput = page.getByPlaceholderText(/recipient address/i)
    const amountInput = page.getByPlaceholderText(/amount/i)
    const sendButton = page.getByRole('button', { name: /send/i })

    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')
    await amountInput.fill('0.01')
    
    await expect(sendButton).toBeEnabled()
  })

  test('should display loading state during transaction', async ({ page }) => {
    // This would require wallet connection mock
    // Placeholder for now
    const sendButton = page.getByRole('button', { name: /send/i })
    await expect(sendButton).toBeVisible()
  })
})

