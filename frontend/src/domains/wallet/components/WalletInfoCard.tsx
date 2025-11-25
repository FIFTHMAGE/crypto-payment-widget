import { AddressDisplay } from '../../../components/common'
import { Card } from '../../../components/ui'
import { useWalletBalance, useWalletConnection } from '../hooks'

export function WalletInfoCard() {
  const { address, chainId } = useWalletConnection()
  const { data: balance, isLoading } = useWalletBalance()

  if (!address) return null

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Wallet Information</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-600">Address</p>
          <AddressDisplay address={address} showCopy />
        </div>
        <div>
          <p className="text-xs text-gray-600">Chain ID</p>
          <p className="font-medium">{chainId}</p>
        </div>
        {isLoading ? (
          <div className="h-6 bg-gray-100 animate-pulse rounded" />
        ) : (
          balance && (
            <div>
              <p className="text-xs text-gray-600">Balance</p>
              <p className="font-medium">
                {parseFloat(balance.native).toFixed(4)} {balance.nativeSymbol}
              </p>
            </div>
          )
        )}
      </div>
    </Card>
  )
}

