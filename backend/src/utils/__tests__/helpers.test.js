import { describe, it, expect } from '@jest/globals'
import { sleep, retry, parseBoolean, parseNumber, chunk } from '../helpers.js'

describe('Helper Utils', () => {
  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now()
      await sleep(100)
      const duration = Date.now() - start

      expect(duration).toBeGreaterThanOrEqual(100)
    })
  })

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 3) throw new Error('Fail')
        return 'success'
      }

      const result = await retry(fn, 3)

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should throw after max attempts', async () => {
      const fn = async () => {
        throw new Error('Always fails')
      }

      await expect(retry(fn, 2)).rejects.toThrow('Always fails')
    })
  })

  describe('parseBoolean', () => {
    it('should parse boolean strings', () => {
      expect(parseBoolean('true')).toBe(true)
      expect(parseBoolean('false')).toBe(false)
      expect(parseBoolean('1')).toBe(true)
      expect(parseBoolean('0')).toBe(false)
    })

    it('should handle actual booleans', () => {
      expect(parseBoolean(true)).toBe(true)
      expect(parseBoolean(false)).toBe(false)
    })

    it('should default to false for invalid input', () => {
      expect(parseBoolean('invalid')).toBe(false)
      expect(parseBoolean(null)).toBe(false)
    })
  })

  describe('parseNumber', () => {
    it('should parse number strings', () => {
      expect(parseNumber('123')).toBe(123)
      expect(parseNumber('45.67')).toBe(45.67)
    })

    it('should return default for invalid input', () => {
      expect(parseNumber('invalid', 0)).toBe(0)
      expect(parseNumber('', 10)).toBe(10)
    })
  })

  describe('chunk', () => {
    it('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7]
      const result = chunk(arr, 3)

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    })

    it('should handle empty arrays', () => {
      expect(chunk([], 2)).toEqual([])
    })
  })
})

