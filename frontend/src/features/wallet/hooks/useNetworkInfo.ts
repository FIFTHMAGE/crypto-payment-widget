import { useChainId, useSwitchChain, useChains } from 'wagmi'
import { blockchainService } from '../../../services'
import type { NetworkInfo } from '../../../lib/types'

export function useNetworkInfo() {
  const chainId = useChainId()
  const chains = useChains()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const currentChain = chains.find((c) => c.id === chainId)

  const networkInfo: NetworkInfo | null = currentChain
    ? {
        chainId: currentChain.id,
        name: currentChain.name,
        currency: currentChain.nativeCurrency.symbol,
        explorerUrl: blockchainService.getExplorerUrl(currentChain.id),
        rpcUrl: currentChain.rpcUrls.default.http[0],
      }
    : null

  const switchNetwork = (targetChainId: number) => {
    switchChain({ chainId: targetChainId })
  }

  return {
    networkInfo,
    currentChainId: chainId,
    supportedChains: chains,
    switchNetwork,
    isSwitching,
    isTestnet: blockchainService.isTestnet(chainId),
  }
}

