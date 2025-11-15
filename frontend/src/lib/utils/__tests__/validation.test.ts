import { describe, it, expect } from 'vitest'
import {
  isValidAddress,
  isValidAmount,
  isValidEmail,
  isValidUrl,
  isValidTxHash,
} from '../validation'

describe('validation utils', () => {
  describe('isValidAddress', () => {
    it('should validate correct ethereum address', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(true)
    })

    it('should reject invalid address', () => {
      expect(isValidAddress('0x123')).toBe(false)
      expect(isValidAddress('invalid')).toBe(false)
      expect(isValidAddress('')).toBe(false)
    })

    it('should reject address without 0x prefix', () => {
      expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(false)
    })
  })

  describe('isValidAmount', () => {
    it('should validate positive numbers', () => {
      expect(isValidAmount('1')).toBe(true)
      expect(isValidAmount('0.001')).toBe(true)
      expect(isValidAmount('1000.50')).toBe(true)
    })

    it('should reject zero and negative numbers', () => {
      expect(isValidAmount('0')).toBe(false)
      expect(isValidAmount('-1')).toBe(false)
    })

    it('should reject invalid formats', () => {
      expect(isValidAmount('abc')).toBe(false)
      expect(isValidAmount('')).toBe(false)
      expect(isValidAmount('1.2.3')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('isValidTxHash', () => {
    it('should validate correct transaction hash', () => {
      const hash = '0x' + '1'.repeat(64)
      expect(isValidTxHash(hash)).toBe(true)
    })

    it('should reject invalid transaction hash', () => {
      expect(isValidTxHash('0x123')).toBe(false)
      expect(isValidTxHash('invalid')).toBe(false)
    })
  })
})

