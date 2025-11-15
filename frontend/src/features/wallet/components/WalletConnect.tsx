import React from 'react'
import { useAccount } from 'wagmi'
import { formatAddress } from '../../../lib/utils'

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount()

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium text-green-800">
            Connected: {formatAddress(address)}
          </span>
        </div>
        <appkit-button />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <appkit-button />
    </div>
  )
}

