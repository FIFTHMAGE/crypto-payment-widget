import { describe, it, expect } from 'vitest'
import { buildUrl, parseQueryString, getExplorerUrl } from '../url'

describe('URL Utils', () => {
  describe('buildUrl', () => {
    it('should build URL with params', () => {
      const url = buildUrl('/api/test', { foo: 'bar', baz: '123' })
      expect(url).toContain('/api/test')
      expect(url).toContain('foo=bar')
      expect(url).toContain('baz=123')
    })

    it('should handle empty params', () => {
      const url = buildUrl('/api/test', {})
      expect(url).toBe('/api/test')
    })
  })

  describe('parseQueryString', () => {
    it('should parse query string', () => {
      const params = parseQueryString('?foo=bar&baz=123')
      expect(params).toEqual({ foo: 'bar', baz: '123' })
    })

    it('should handle empty query', () => {
      const params = parseQueryString('')
      expect(params).toEqual({})
    })
  })

  describe('getExplorerUrl', () => {
    it('should build explorer URL for transaction', () => {
      const url = getExplorerUrl('0x123', 'tx', 1)
      expect(url).toContain('etherscan.io')
      expect(url).toContain('0x123')
    })

    it('should build explorer URL for address', () => {
      const url = getExplorerUrl('0x456', 'address', 1)
      expect(url).toContain('address/0x456')
    })
  })
})

