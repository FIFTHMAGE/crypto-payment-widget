import { describe, it, expect } from 'vitest'
import { formatTimestamp, getRelativeTime, addMinutes, isExpired } from '../time'

describe('Time Utils', () => {
  describe('formatTimestamp', () => {
    it('should format unix timestamp', () => {
      const timestamp = 1705315800000
      const result = formatTimestamp(timestamp)
      expect(result).toContain('2024')
    })

    it('should handle date string', () => {
      const dateStr = '2024-01-15T10:30:00Z'
      const result = formatTimestamp(dateStr)
      expect(result).toBeTruthy()
    })
  })

  describe('getRelativeTime', () => {
    it('should show just now for recent time', () => {
      const now = Date.now()
      expect(getRelativeTime(now)).toBe('Just now')
    })

    it('should show minutes ago', () => {
      const fiveMin = Date.now() - 5 * 60 * 1000
      expect(getRelativeTime(fiveMin)).toContain('minute')
    })

    it('should show hours ago', () => {
      const twoHours = Date.now() - 2 * 60 * 60 * 1000
      expect(getRelativeTime(twoHours)).toContain('hour')
    })
  })

  describe('addMinutes', () => {
    it('should add minutes to date', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const result = addMinutes(date, 30)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('isExpired', () => {
    it('should detect expired timestamps', () => {
      const past = Date.now() - 10000
      expect(isExpired(past)).toBe(true)
    })

    it('should return false for future timestamps', () => {
      const future = Date.now() + 10000
      expect(isExpired(future)).toBe(false)
    })
  })
})

