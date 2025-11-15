import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { walletApiClient } from '../api'

export function useWalletBalance() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['wallet-balance', address],
    queryFn: () => walletApiClient.getBalance(address!),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  })
}

export function useTokenBalances() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['token-balances', address],
    queryFn: () => walletApiClient.getTokenBalances(address!),
    enabled: !!address,
    staleTime: 30000,
    refetchInterval: 60000,
  })
}

export function useWalletStats() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['wallet-stats', address],
    queryFn: () => walletApiClient.getStats(address!),
    enabled: !!address,
    staleTime: 300000, // 5 minutes
  })
}

