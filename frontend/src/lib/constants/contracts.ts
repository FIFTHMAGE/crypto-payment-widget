import type { Address } from 'viem'

export const CONTRACT_ADDRESSES: Record<number, Address> = {
  1: (import.meta.env.VITE_CONTRACT_ADDRESS_MAINNET || '0x0') as Address,
  11155111: (import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA || import.meta.env.VITE_CONTRACT_ADDRESS || '0x0') as Address,
  137: (import.meta.env.VITE_CONTRACT_ADDRESS_POLYGON || '0x0') as Address,
  8453: (import.meta.env.VITE_CONTRACT_ADDRESS_BASE || '0x0') as Address,
  42161: (import.meta.env.VITE_CONTRACT_ADDRESS_ARBITRUM || '0x0') as Address,
}

export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000'

export const NATIVE_TOKEN_ADDRESS = ZERO_ADDRESS

export const PLATFORM_FEE_PERCENTAGE = 0.25 // 0.25%

