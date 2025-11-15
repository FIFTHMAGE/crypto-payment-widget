import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { AmountDisplay } from '../../../components/common'
import { useUIStore } from '../../../store'
import { isValidAddress } from '../../../lib/utils/validation'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  priceUSD: number
  logoURI?: string
  isNative?: boolean
  isCustom?: boolean
}

const DEFAULT_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    balance: '1.234',
    priceUSD: 2000,
    isNative: true,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: '500.00',
    priceUSD: 1,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    balance: '250.50',
    priceUSD: 1,
  },
]

export const TokenManager = () => {
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [newToken, setNewToken] = useState({
    address: '',
    symbol: '',
    name: '',
    decimals: '18',
  })

  const { addToast } = useUIStore()

  const handleAddToken = () => {
    if (!newToken.address || !newToken.symbol || !newToken.name) {
      addToast('Please fill in all fields', 'error')
      return
    }

    if (!isValidAddress(newToken.address)) {
      addToast('Invalid token address', 'error')
      return
    }

    if (tokens.some(t => t.address.toLowerCase() === newToken.address.toLowerCase())) {
      addToast('Token already added', 'error')
      return
    }

    const token: Token = {
      address: newToken.address,
      symbol: newToken.symbol,
      name: newToken.name,
      decimals: parseInt(newToken.decimals) || 18,
      balance: '0',
      priceUSD: 0,
      isCustom: true,
    }

    setTokens([...tokens, token])
    setNewToken({ address: '', symbol: '', name: '', decimals: '18' })
    setShowAddForm(false)
    addToast('Token added successfully!', 'success')
  }

  const handleRemoveToken = (address: string) => {
    if (tokens.find(t => t.address === address)?.isNative) {
      addToast('Cannot remove native token', 'error')
      return
    }

    setTokens(tokens.filter(t => t.address !== address))
    addToast('Token removed', 'info')
  }

  const handleImportFromList = (token: Token) => {
    if (tokens.some(t => t.address === token.address)) {
      addToast('Token already added', 'info')
      return
    }
    setTokens([...tokens, token])
    addToast(`${token.symbol} added!`, 'success')
  }

  const filteredTokens = tokens.filter(
    token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalValueUSD = tokens.reduce(
    (acc, token) => acc + parseFloat(token.balance) * token.priceUSD,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Token Manager</h2>
          <p className="text-gray-600">Total Value: ${totalValueUSD.toFixed(2)}</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Token'}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Add Custom Token</h3>

          <div className="space-y-4">
            <Input
              label="Token Contract Address *"
              placeholder="0x..."
              value={newToken.address}
              onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Token Symbol *"
                placeholder="e.g., USDC"
                value={newToken.symbol}
                onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
              />

              <Input
                label="Decimals"
                type="number"
                value={newToken.decimals}
                onChange={(e) => setNewToken({ ...newToken, decimals: e.target.value })}
              />
            </div>

            <Input
              label="Token Name *"
              placeholder="e.g., USD Coin"
              value={newToken.name}
              onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
            />

            <Button onClick={handleAddToken} fullWidth>
              Add Token
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      <div className="space-y-3">
        {filteredTokens.map((token) => (
          <Card key={token.address} padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    token.symbol.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{token.symbol}</p>
                    {token.isNative && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Native
                      </span>
                    )}
                    {token.isCustom && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{token.name}</p>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="text-right mr-4">
                <AmountDisplay amount={token.balance} symbol={token.symbol} />
                <p className="text-sm text-gray-600">
                  ${(parseFloat(token.balance) * token.priceUSD).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Send
                </Button>
                {!token.isNative && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveToken(token.address)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTokens.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No tokens found matching "{searchQuery}"
          </div>
        </Card>
      )}
    </div>
  )
}

