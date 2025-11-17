import { Button } from '../../../components/ui'
import { useWalletConnection } from '../hooks'

export function WalletConnectButton() {
  const { isConnected, isConnecting, connect, disconnect, address } =
    useWalletConnection()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={() => connect()} loading={isConnecting} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}

