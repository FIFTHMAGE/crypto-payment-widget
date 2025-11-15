export interface WalletBalance {
  address: string
  native: string
  nativeSymbol: string
  usdValue?: string
  lastUpdated: number
}

export interface TokenBalance {
  token: string
  tokenAddress: string
  symbol: string
  decimals: number
  balance: string
  balanceFormatted: string
  usdValue?: string
  logo?: string
}

export interface WalletTransaction {
  hash: string
  from: string
  to: string
  value: string
  token?: string
  tokenSymbol?: string
  timestamp: number
  blockNumber: number
  status: 'pending' | 'confirmed' | 'failed'
  type: 'send' | 'receive' | 'contract'
  gasUsed?: string
  gasPrice?: string
}

export interface WalletStats {
  address: string
  totalTransactions: number
  totalSent: string
  totalReceived: string
  firstTransactionDate?: number
  lastTransactionDate?: number
  topTokens: Array<{
    symbol: string
    balance: string
    usdValue?: string
  }>
}

export interface Chain {
  id: number
  name: string
  network: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: {
    default: { http: string[] }
    public: { http: string[] }
  }
  blockExplorers?: {
    default: { name: string; url: string }
  }
  testnet: boolean
}

export interface WalletConnection {
  address: string
  chainId: number
  isConnected: boolean
  connector?: {
    id: string
    name: string
    type: string
  }
}

export interface ENSProfile {
  name: string
  address: string
  avatar?: string
  description?: string
  url?: string
  twitter?: string
  github?: string
}

