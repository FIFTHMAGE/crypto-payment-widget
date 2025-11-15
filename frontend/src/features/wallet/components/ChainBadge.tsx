import React from 'react'
import { Badge } from '../../../components/ui'
import { blockchainService } from '../../../services'
import { useChainId } from 'wagmi'

export const ChainBadge: React.FC = () => {
  const chainId = useChainId()
  const chainName = blockchainService.getChainName(chainId)
  const isTestnet = blockchainService.isTestnet(chainId)

  return (
    <Badge variant={isTestnet ? 'warning' : 'success'} size="sm">
      {chainName}
      {isTestnet && ' (Testnet)'}
    </Badge>
  )
}

