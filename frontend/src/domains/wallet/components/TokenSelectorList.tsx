import { useState } from 'react'
import { Card, Input } from '../../../components/ui'
import { useTokenBalances } from '../hooks'

export function TokenSelectorList({ onSelect }: { onSelect?: (token: any) => void }) {
  const { data: tokens, isLoading } = useTokenBalances()
  const [search, setSearch] = useState('')

  const filteredTokens = tokens?.filter((token) =>
    token.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Select Token</h3>
      <Input
        placeholder="Search tokens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div>Loading tokens...</div>
        ) : filteredTokens && filteredTokens.length > 0 ? (
          filteredTokens.map((token) => (
            <button
              key={token.tokenAddress}
              onClick={() => onSelect?.(token)}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{token.symbol}</p>
                  <p className="text-sm text-gray-600">{token.token}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{token.balanceFormatted}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No tokens found</p>
        )}
      </div>
    </Card>
  )
}

