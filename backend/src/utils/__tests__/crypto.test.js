import { describe, it, expect } from '@jest/globals'
import { hash, compare, encrypt, decrypt, generateToken } from '../crypto.js'

describe('Crypto Utils', () => {
  describe('hash', () => {
    it('should hash data', async () => {
      const data = 'test-data'
      const hashed = await hash(data)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(data)
    })

    it('should produce consistent hashes', async () => {
      const data = 'test-data'
      const hash1 = await hash(data)
      const hash2 = await hash(data)

      expect(hash1).toBe(hash2)
    })
  })

  describe('compare', () => {
    it('should verify correct data', async () => {
      const data = 'test-data'
      const hashed = await hash(data)

      const isValid = await compare(data, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect data', async () => {
      const data = 'test-data'
      const hashed = await hash(data)

      const isValid = await compare('wrong-data', hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data', async () => {
      const data = 'sensitive-data'

      const encrypted = await encrypt(data)
      expect(encrypted).not.toBe(data)

      const decrypted = await decrypt(encrypted)
      expect(decrypted).toBe(data)
    })

    it('should handle complex objects', async () => {
      const data = { nested: { value: 123 } }

      const encrypted = await encrypt(JSON.stringify(data))
      const decrypted = JSON.parse(await decrypt(encrypted))

      expect(decrypted).toEqual(data)
    })
  })

  describe('generateToken', () => {
    it('should generate random tokens', () => {
      const token1 = generateToken()
      const token2 = generateToken()

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
    })

    it('should generate tokens of specified length', () => {
      const token = generateToken(32)

      expect(token.length).toBe(64) // 32 bytes = 64 hex characters
    })
  })
})

