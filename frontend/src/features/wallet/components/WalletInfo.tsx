import React from 'react'
import { Card } from '../../../components/ui'
import { useWalletInfo } from '../hooks'
import { formatAddress } from '../../../lib/utils'

export const WalletInfo: React.FC = () => {
  const { address, isConnected, formattedBalance, chainId } = useWalletInfo()

  if (!isConnected) return null

  return (
    <Card padding="sm">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Address:</span>
          <span className="font-mono font-medium">{formatAddress(address)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Balance:</span>
          <span className="font-medium">{formattedBalance} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Chain ID:</span>
          <span className="font-medium">{chainId}</span>
        </div>
      </div>
    </Card>
  )
}

