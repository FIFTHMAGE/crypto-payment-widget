import { describe, it, expect } from 'vitest'
import { formatNumber, formatPercent, clamp, roundToDecimals } from '../numbers'

describe('Numbers Utils', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should format decimals', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57')
    })
  })

  describe('formatPercent', () => {
    it('should format percentages', () => {
      expect(formatPercent(0.5)).toBe('50%')
      expect(formatPercent(0.1234, 2)).toBe('12.34%')
    })
  })

  describe('clamp', () => {
    it('should clamp values between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('roundToDecimals', () => {
    it('should round to specified decimals', () => {
      expect(roundToDecimals(1.23456, 2)).toBe(1.23)
      expect(roundToDecimals(1.23456, 4)).toBe(1.2346)
    })
  })
})

