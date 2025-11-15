import { describe, it, expect } from 'vitest'
import { shortenAddress, compareAddresses, isZeroAddress } from '../address'

describe('Address Utils', () => {
  describe('shortenAddress', () => {
    it('should shorten ethereum address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      expect(shortenAddress(address)).toBe('0x742d...0bEb9')
    })

    it('should handle custom length', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      expect(shortenAddress(address, 8)).toBe('0x742d35...5f0bEb9')
    })

    it('should return original for short addresses', () => {
      const address = '0x123'
      expect(shortenAddress(address)).toBe(address)
    })
  })

  describe('compareAddresses', () => {
    it('should return true for same addresses', () => {
      const addr1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      const addr2 = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB9'
      expect(compareAddresses(addr1, addr2)).toBe(true)
    })

    it('should return false for different addresses', () => {
      const addr1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'
      const addr2 = '0x456def789abc123def456abc789def123abc456d'
      expect(compareAddresses(addr1, addr2)).toBe(false)
    })
  })

  describe('isZeroAddress', () => {
    it('should detect zero address', () => {
      expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true)
    })

    it('should return false for non-zero address', () => {
      expect(isZeroAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')).toBe(false)
    })
  })
})

