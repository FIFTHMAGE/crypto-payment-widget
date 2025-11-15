import { describe, it, expect } from 'vitest'
import { parseEther, formatEther } from 'viem'

describe('Blockchain Service', () => {
  it('should parse ether values', () => {
    const result = parseEther('1.5')
    expect(result).toBeDefined()
    expect(typeof result).toBe('bigint')
  })

  it('should format ether values', () => {
    const wei = parseEther('1.5')
    const eth = formatEther(wei)
    expect(eth).toBe('1.5')
  })

  it('should handle zero values', () => {
    const zero = parseEther('0')
    expect(formatEther(zero)).toBe('0')
  })
})

