import { Card } from '../../../components/ui'
import { AmountDisplay, AddressDisplay } from '../../../components/common'
import { useAccount, useBalance } from 'wagmi'

interface Token {
  symbol: string
  balance: string
  value: string
  change24h: number
}

export const WalletPortfolio = () => {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  // Mock token data - in production, fetch from API
  const tokens: Token[] = [
    { symbol: 'ETH', balance: balance?.formatted || '0', value: '2000.00', change24h: 2.5 },
    { symbol: 'USDC', balance: '1000.00', value: '1000.00', change24h: 0.1 },
    { symbol: 'DAI', balance: '500.00', value: '500.00', change24h: -0.2 },
  ]

  const totalValue = tokens.reduce((sum, token) => sum + parseFloat(token.value), 0)

  if (!isConnected || !address) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Connect your wallet to view portfolio</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 mb-2">Total Portfolio Value</p>
          <p className="text-4xl font-bold mb-1">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-600">+2.3% (24h)</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Assets</h3>

        <div className="space-y-3">
          {tokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {token.symbol[0]}
                </div>
                <div>
                  <p className="font-medium">{token.symbol}</p>
                  <p className="text-sm text-gray-600">{token.balance}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${token.value}</p>
                <p
                  className={`text-sm ${
                    token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {token.change24h >= 0 ? '+' : ''}
                  {token.change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Wallet Address</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <AddressDisplay address={address} copyable linkToExplorer chainId={1} />
        </div>
      </Card>
    </div>
  )
}

