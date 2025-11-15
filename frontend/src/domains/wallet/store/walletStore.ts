import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WalletConnection, Chain, TokenBalance } from '../types'

interface WalletState {
  // Connection state
  connection: WalletConnection | null
  isConnecting: boolean
  error: Error | null

  // Chain & Network
  selectedChain: Chain | null
  supportedChains: Chain[]

  // Token state
  selectedToken: TokenBalance | null
  recentTokens: TokenBalance[]

  // Actions
  setConnection: (connection: WalletConnection | null) => void
  setConnecting: (isConnecting: boolean) => void
  setError: (error: Error | null) => void

  // Chain actions
  setSelectedChain: (chain: Chain | null) => void
  setSupportedChains: (chains: Chain[]) => void

  // Token actions
  setSelectedToken: (token: TokenBalance | null) => void
  addRecentToken: (token: TokenBalance) => void
  clearRecentTokens: () => void

  // Reset
  reset: () => void
}

const initialState = {
  connection: null,
  isConnecting: false,
  error: null,
  selectedChain: null,
  supportedChains: [],
  selectedToken: null,
  recentTokens: [],
}

export const useWalletStore = create<WalletState>()(
  devtools((set) => ({
    ...initialState,

    setConnection: (connection) => set({ connection, error: null }),

    setConnecting: (isConnecting) => set({ isConnecting }),

    setError: (error) => set({ error, isConnecting: false }),

    setSelectedChain: (chain) => set({ selectedChain: chain }),

    setSupportedChains: (chains) => set({ supportedChains: chains }),

    setSelectedToken: (token) => set({ selectedToken: token }),

    addRecentToken: (token) =>
      set((state) => {
        const exists = state.recentTokens.some(
          (t) => t.tokenAddress === token.tokenAddress
        )
        if (exists) return state

        return {
          recentTokens: [token, ...state.recentTokens].slice(0, 10),
        }
      }),

    clearRecentTokens: () => set({ recentTokens: [] }),

    reset: () => set(initialState),
  }))
)

