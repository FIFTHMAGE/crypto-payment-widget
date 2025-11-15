import type { Address } from 'viem'
import { ADDRESS_REGEX } from '../constants'

export function formatAddress(address: string | Address, length = 4): string {
  if (!address) return ''
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address)
}

export function normalizeAddress(address: string): Address {
  return address.toLowerCase() as Address
}

export function compareAddresses(a: string, b: string): boolean {
  return normalizeAddress(a) === normalizeAddress(b)
}

export function truncateMiddle(text: string, maxLength = 20): string {
  if (text.length <= maxLength) return text
  const half = Math.floor(maxLength / 2)
  return `${text.slice(0, half)}...${text.slice(-half)}`
}

