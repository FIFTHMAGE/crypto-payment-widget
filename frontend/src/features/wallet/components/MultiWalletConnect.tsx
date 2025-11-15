import { useState } from 'react'
import { Card, Button } from '../../../components/ui'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { AddressDisplay } from '../../../components/common'

export const MultiWalletConnect = () => {
  const { connectors, connect } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (connectorId: string) => {
    setConnecting(connectorId)
    try {
      const connector = connectors.find(c => c.id === connectorId)
      if (connector) {
        await connect({ connector })
      }
    } finally {
      setConnecting(null)
    }
  }

  const walletOptions = [
    {
      id: 'injected',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask browser extension',
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      icon: '📱',
      description: 'Connect using WalletConnect',
    },
    {
      id: 'coinbaseWallet',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect using Coinbase Wallet',
    },
  ]

  if (isConnected && address) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            <div>
              <p className="font-medium">Connected</p>
              <AddressDisplay address={address} />
            </div>
          </div>
          <Button variant="outline" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>

      <div className="space-y-3">
        {walletOptions.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={connecting !== null}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{wallet.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-600">{wallet.description}</p>
              </div>
              {connecting === wallet.id && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By connecting, you agree to our Terms of Service
      </p>
    </Card>
  )
}

