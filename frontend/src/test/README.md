# Testing Guide

This directory contains all test files for the frontend application.

## Structure

```
test/
├── e2e/                    # End-to-end tests (Playwright)
├── fixtures/               # Test fixtures and mock data
├── integration/            # Integration tests
├── mocks/                  # Mock implementations
├── performance/            # Performance tests
├── setup/                  # Test setup and configuration
├── utils/                  # Test utilities
└── visual/                 # Visual regression tests
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test:coverage

# Run with UI
npm test:ui
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific browser
npx playwright test --project=chromium
```

## Test Patterns

### Unit Tests

Located alongside the source files in `__tests__` directories:

```typescript
// Example: src/lib/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatAddress } from '../format'

describe('formatAddress', () => {
  it('should format ethereum address', () => {
    expect(formatAddress('0x742d...')).toBe('0x742d...0bEb')
  })
})
```

### Component Tests

```typescript
// Example: src/components/ui/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Example: src/test/integration/payment-flow.test.tsx
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Payment Flow', () => {
  it('completes payment successfully', async () => {
    // Test full user flow
  })
})
```

### E2E Tests

```typescript
// Example: src/test/e2e/wallet-connection.spec.ts
import { test, expect } from '@playwright/test'

test('connects wallet', async ({ page }) => {
  await page.goto('/')
  await page.click('button:has-text("Connect Wallet")')
  // ...
})
```

## Mocking

### Wagmi Hooks

```typescript
import { mockUseAccount, mockUseConnect } from '../mocks/wagmi'

// Mocks are automatically applied via vi.mock()
```

### API Calls

```typescript
import { mockLogTransaction } from '../mocks/api'

// Use in tests
mockLogTransaction.mockResolvedValue({ success: true })
```

## Custom Matchers

```typescript
// Available custom matchers
expect('0x742d...').toBeValidAddress()
expect('0.01').toBePositiveAmount()
expect('0x123...').toBeValidTransactionHash()
```

## Coverage Goals

- Unit Tests: > 80%
- Integration Tests: > 70%
- E2E Tests: Critical user flows

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test Behavior, Not Implementation**: Focus on what users see
3. **Use Testing Library Queries**: Prefer `getByRole`, `getByLabelText`
4. **Mock External Dependencies**: Use provided mocks
5. **Keep Tests Independent**: Each test should run in isolation
6. **Use Descriptive Names**: Test names should explain what they test

## Continuous Integration

Tests run automatically on:
- Pre-commit (unit tests only)
- Pull requests (all tests)
- Main branch (all tests + coverage)

## Debugging

```bash
# Debug specific test
npm test -- --reporter=verbose path/to/test.ts

# Debug E2E with browser
npm run test:e2e:debug

# View test UI
npm run test:ui
```

