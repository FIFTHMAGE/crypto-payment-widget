import type { Address } from 'viem'

export interface WalletInfo {
  address: Address
  isConnected: boolean
  chainId?: number
  balance?: string
}

export interface NetworkInfo {
  chainId: number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
}

export interface TokenInfo {
  address: Address
  symbol: string
  name: string
  decimals: number
  balance?: string
  logoUrl?: string
}

export interface WalletConnection {
  connector?: string
  isConnecting: boolean
  isReconnecting: boolean
  pendingConnector?: string
}

