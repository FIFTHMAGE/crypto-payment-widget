import { Card } from '../../../components/ui'
import { AddressDisplay, AmountDisplay } from '../../../components/common'
import { useWalletBalance, useWalletConnection } from '../hooks'

export function WalletCard() {
  const { address, isConnected } = useWalletConnection()
  const { data: balance, isLoading } = useWalletBalance()

  if (!isConnected || !address) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No wallet connected</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Connected Wallet
          </h3>
          <AddressDisplay address={address} showCopy />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Balance</h3>
          {isLoading ? (
            <div className="h-8 bg-gray-100 animate-pulse rounded" />
          ) : balance ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Native</span>
                <AmountDisplay
                  amount={balance.native}
                  symbol="ETH"
                  className="text-xl font-bold"
                />
              </div>
              {balance.usdValue && (
                <p className="text-sm text-gray-500 text-right">
                  ≈ ${parseFloat(balance.usdValue).toFixed(2)} USD
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Unable to load balance</p>
          )}
        </div>
      </div>
    </Card>
  )
}

