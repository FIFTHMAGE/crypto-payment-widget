import React from 'react'
import { useNetworkInfo } from '../hooks'
import { Button } from '../../../components/ui'

export const NetworkSelector: React.FC = () => {
  const { networkInfo, supportedChains, switchNetwork, isSwitching } =
    useNetworkInfo()

  if (!networkInfo) return null

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">
        Current Network: <span className="font-semibold">{networkInfo.name}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {supportedChains.map((chain) => (
          <Button
            key={chain.id}
            size="sm"
            variant={chain.id === networkInfo.chainId ? 'primary' : 'outline'}
            onClick={() => switchNetwork(chain.id)}
            disabled={isSwitching || chain.id === networkInfo.chainId}
          >
            {chain.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

