export const mockWallet = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  balance: '1.234567890123456789',
  balanceFormatted: '1.23',
  ensName: 'testuser.eth',
  connector: 'injected' as const,
}

export const mockWalletWithoutENS = {
  address: '0x456def789abc123def456abc789def123abc456d',
  balance: '0.5',
  balanceFormatted: '0.50',
  ensName: null,
  connector: 'walletConnect' as const,
}

export const mockEmptyWallet = {
  address: '0x789ghi012jkl345mno678pqr901stu234vwx567y',
  balance: '0',
  balanceFormatted: '0.00',
  ensName: null,
  connector: 'coinbaseWallet' as const,
}

export const mockConnectedAccount = {
  address: mockWallet.address,
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
  isReconnecting: false,
  status: 'connected' as const,
}

export const mockDisconnectedAccount = {
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  isReconnecting: false,
  status: 'disconnected' as const,
}

export const mockConnectingAccount = {
  address: undefined,
  isConnected: false,
  isConnecting: true,
  isDisconnected: false,
  isReconnecting: false,
  status: 'connecting' as const,
}
