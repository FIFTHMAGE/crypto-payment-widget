import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should not have accessibility violations on home page', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeFocused()

    await page.keyboard.press('Tab')
    const simplePayment = page.getByRole('button', { name: /simple payment/i })
    await expect(simplePayment).toBeFocused()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // All buttons should have accessible names
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const accessibleName = await button.getAttribute('aria-label') || 
                             await button.textContent()
      expect(accessibleName).toBeTruthy()
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    )
    expect(contrastViolations).toEqual([])
  })
})

