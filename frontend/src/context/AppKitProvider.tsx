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
// Use a dummy project ID if not provided to prevent blank screen
const effectiveProjectId = projectId && projectId.trim() !== '' && projectId !== 'your-project-id-here' 
  ? projectId 
  : '0000000000000000000000000000000000000000000000000000000000000000' // Dummy fallback

if (projectId === 'your-project-id-here' || !projectId || projectId.trim() === '') {
  console.error(
    '⚠️ IMPORTANT: WalletConnect Project ID is missing!\n' +
    'Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.\n' +
    'Get your Project ID from https://cloud.walletconnect.com\n' +
    'The app will load but wallet connection will not work.'
  )
}

try {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: effectiveProjectId,
    networks: networks,
    defaultNetwork: mainnet,
    metadata,
    features: {
      analytics: true, // Optional: enable analytics
    },
  })
} catch (error) {
  console.error('Failed to initialize AppKit:', error)
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

