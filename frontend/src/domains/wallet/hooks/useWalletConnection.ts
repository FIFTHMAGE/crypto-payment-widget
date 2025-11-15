import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { useUIStore } from '../../../store'

export function useWalletConnection() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { addToast } = useUIStore()

  const handleConnect = async (connectorId?: string) => {
    try {
      const connector = connectorId
        ? connectors.find((c) => c.id === connectorId)
        : connectors[0]

      if (!connector) {
        throw new Error('No connector available')
      }

      connect({ connector })
    } catch (error) {
      addToast(
        `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    }
  }

  const handleDisconnect = async () => {
    try {
      disconnect()
      addToast('Wallet disconnected', 'info')
    } catch (error) {
      addToast(
        `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    }
  }

  return {
    address,
    chainId,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    connectors,
    connect: handleConnect,
    disconnect: handleDisconnect,
  }
}

