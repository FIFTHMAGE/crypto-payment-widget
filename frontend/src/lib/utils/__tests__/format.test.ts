import { describe, it, expect } from 'vitest'
import { formatAddress, formatAmount, formatDate, formatTimeAgo } from '../format'

describe('format utils', () => {
  describe('formatAddress', () => {
    it('should format ethereum address with default length', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      expect(formatAddress(address)).toBe('0x742d...0bEb9')
    })

    it('should format address with custom length', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      expect(formatAddress(address, 8)).toBe('0x742d35...5f0bEb9')
    })

    it('should return original if address is too short', () => {
      const address = '0x123'
      expect(formatAddress(address)).toBe(address)
    })
  })

  describe('formatAmount', () => {
    it('should format large amounts with commas', () => {
      expect(formatAmount('1000000')).toBe('1,000,000')
    })

    it('should format decimal amounts', () => {
      expect(formatAmount('1234.5678')).toBe('1,234.5678')
    })

    it('should handle decimals parameter', () => {
      expect(formatAmount('1234.56789', 2)).toBe('1,234.57')
    })

    it('should handle zero', () => {
      expect(formatAmount('0')).toBe('0')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-15T10:30:00Z'
      const result = formatDate(date)
      expect(result).toContain('2024')
    })

    it('should handle timestamp', () => {
      const timestamp = 1705315800000
      const result = formatDate(timestamp)
      expect(result).toBeTruthy()
    })
  })

  describe('formatTimeAgo', () => {
    it('should show just now for recent time', () => {
      const now = Date.now()
      expect(formatTimeAgo(now)).toBe('Just now')
    })

    it('should show minutes ago', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago')
    })

    it('should show hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      expect(formatTimeAgo(twoHoursAgo)).toBe('2 hours ago')
    })

    it('should show days ago', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
      expect(formatTimeAgo(threeDaysAgo)).toBe('3 days ago')
    })
  })
})

