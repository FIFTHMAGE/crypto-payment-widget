import React from 'react'
import { Card, Skeleton } from '../../../components/ui'
import { AmountDisplay } from '../../../components/common'
import { useWalletInfo } from '../hooks'

export const WalletBalance: React.FC = () => {
  const { isConnected, balance, isLoading } = useWalletInfo()

  if (!isConnected) return null

  return (
    <Card padding="sm">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Available Balance</p>
        {isLoading ? (
          <Skeleton width="120px" height="2rem" className="mx-auto" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            <AmountDisplay amount={balance || '0'} decimals={6} />
          </div>
        )}
      </div>
    </Card>
  )
}

