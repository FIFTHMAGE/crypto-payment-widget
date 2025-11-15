import { useState } from 'react'
import { Select } from '../../../components/ui'

interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  icon?: string
}

const SUPPORTED_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: '⟠',
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '💵',
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    icon: '💵',
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: '💰',
  },
]

interface TokenSelectorProps {
  value: string
  onChange: (token: Token) => void
  disabled?: boolean
}

export const TokenSelector = ({ value, onChange, disabled }: TokenSelectorProps) => {
  const [selectedToken, setSelectedToken] = useState<Token>(
    SUPPORTED_TOKENS.find(t => t.address === value) || SUPPORTED_TOKENS[0]
  )

  const handleChange = (address: string) => {
    const token = SUPPORTED_TOKENS.find(t => t.address === address)
    if (token) {
      setSelectedToken(token)
      onChange(token)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Token
      </label>
      <Select
        value={selectedToken.address}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      >
        {SUPPORTED_TOKENS.map((token) => (
          <option key={token.address} value={token.address}>
            {token.icon} {token.symbol} - {token.name}
          </option>
        ))}
      </Select>
      <p className="text-xs text-gray-500">
        Balance: {/* TODO: Show token balance */} {selectedToken.symbol}
      </p>
    </div>
  )
}

