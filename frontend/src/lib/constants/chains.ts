import { mainnet, arbitrum, base, polygon, sepolia } from '@reown/appkit/networks'
import type { Chain } from 'viem'

export const SUPPORTED_CHAINS: [Chain, ...Chain[]] = [
  mainnet,
  arbitrum,
  base,
  polygon,
  sepolia,
]

export const CHAIN_EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  56: 'https://bscscan.com',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  11155111: 'https://sepolia.etherscan.io',
}

export const DEFAULT_CHAIN_ID = 1 // Ethereum mainnet

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BNB Chain',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  11155111: 'Sepolia',
}

