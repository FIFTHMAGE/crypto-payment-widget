export const mockWallet = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9' as `0x${string}`,
  balance: {
    value: BigInt('1500000000000000000'),
    formatted: '1.5',
    symbol: 'ETH',
  },
  chainId: 1,
  connector: {
    id: 'metaMask',
    name: 'MetaMask',
  },
}

export const mockWallets = [
  mockWallet,
  {
    address: '0x456def789abc123def456abc789def123abc456d' as `0x${string}`,
    balance: {
      value: BigInt('2000000000000000000'),
      formatted: '2.0',
      symbol: 'ETH',
    },
    chainId: 1,
    connector: {
      id: 'walletConnect',
      name: 'WalletConnect',
    },
  },
]

