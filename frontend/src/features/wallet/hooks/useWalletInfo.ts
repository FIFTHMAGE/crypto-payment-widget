import { useAccount, useBalance, useChainId } from 'wagmi'
import type { WalletInfo } from '../../../lib/types'
import { formatEther } from '../../../lib/utils'

export function useWalletInfo(): WalletInfo & {
  formattedBalance: string
  isLoading: boolean
} {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance, isLoading } = useBalance({
    address,
  })

  return {
    address: address!,
    isConnected,
    chainId,
    balance: balance?.value.toString(),
    formattedBalance: balance ? formatEther(balance.value) : '0',
    isLoading,
  }
}

