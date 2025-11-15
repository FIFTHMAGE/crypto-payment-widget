import { describe, it, expect } from '@jest/globals'
import { isValidAddress, isValidTxHash, isValidAmount, sanitizeInput } from '../validation.js'

describe('Validation Utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct ethereum address', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(isValidAddress('0x123')).toBe(false)
      expect(isValidAddress('invalid')).toBe(false)
      expect(isValidAddress('')).toBe(false)
    })
  })

  describe('isValidTxHash', () => {
    it('should validate correct transaction hash', () => {
      const hash = '0x742d35cc6634c0532925a3b844bc9e7595f0beb9742d35cc6634c0532925a3b8'
      expect(isValidTxHash(hash)).toBe(true)
    })

    it('should reject invalid hashes', () => {
      expect(isValidTxHash('0x123')).toBe(false)
      expect(isValidTxHash('not-a-hash')).toBe(false)
    })
  })

  describe('isValidAmount', () => {
    it('should validate positive numbers', () => {
      expect(isValidAmount('1.5')).toBe(true)
      expect(isValidAmount('0.001')).toBe(true)
      expect(isValidAmount('100')).toBe(true)
    })

    it('should reject invalid amounts', () => {
      expect(isValidAmount('-1')).toBe(false)
      expect(isValidAmount('abc')).toBe(false)
      expect(isValidAmount('')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('<script>')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })

    it('should handle null/undefined', () => {
      expect(sanitizeInput(null)).toBe('')
      expect(sanitizeInput(undefined)).toBe('')
    })
  })
})

