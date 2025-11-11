'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type Config } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { config, networks, projectId, wagmiAdapter } from '../config/appkit'
import { mainnet } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const metadata = {
  name: 'Crypto Payment Widget',
  description: 'Drop-in crypto payment widget using WalletConnect',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/favicon.ico`],
}

// Initialize AppKit outside the component render cycle
if (projectId && projectId.trim() !== '') {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId,
    networks: networks,
    defaultNetwork: mainnet,
    metadata,
    features: {
      analytics: true, // Optional: enable analytics
    },
  })
} else {
  console.warn(
    '⚠️ AppKit not initialized: Project ID is missing.\n' +
    'Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.\n' +
    'Get your Project ID from https://cloud.walletconnect.com'
  )
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

