import { expect } from 'vitest'

interface CustomMatchers<R = unknown> {
  toBeValidAddress(): R
  toBePositiveAmount(): R
  toBeValidTransactionHash(): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeValidAddress(received: string) {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(received)
    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected ${received} not to be a valid Ethereum address`
          : `Expected ${received} to be a valid Ethereum address`,
    }
  },

  toBePositiveAmount(received: string | number) {
    const amount = typeof received === 'string' ? parseFloat(received) : received
    const isValid = !isNaN(amount) && amount > 0
    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected ${received} not to be a positive amount`
          : `Expected ${received} to be a positive amount`,
    }
  },

  toBeValidTransactionHash(received: string) {
    const isValid = /^0x[a-fA-F0-9]{64}$/.test(received)
    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected ${received} not to be a valid transaction hash`
          : `Expected ${received} to be a valid transaction hash`,
    }
  },
})

