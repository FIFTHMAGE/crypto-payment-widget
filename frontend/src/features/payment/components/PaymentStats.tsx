import React from 'react'
import { useAccount } from 'wagmi'
import { Card, Skeleton } from '../../../components/ui'
import { AmountDisplay } from '../../../components/common'
import { usePaymentStats } from '../hooks'

export const PaymentStats: React.FC = () => {
  const { address } = useAccount()
  const { totalSent, totalReceived, paymentCount } = usePaymentStats(address)

  if (!address) return null

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Statistics
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Sent</p>
          {totalSent !== undefined ? (
            <AmountDisplay amount={totalSent} decimals={4} />
          ) : (
            <Skeleton width="80px" className="mx-auto" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Received</p>
          {totalReceived !== undefined ? (
            <AmountDisplay amount={totalReceived} decimals={4} />
          ) : (
            <Skeleton width="80px" className="mx-auto" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-xl font-bold text-gray-900">
            {paymentCount ?? <Skeleton width="40px" className="mx-auto" />}
          </p>
        </div>
      </div>
    </Card>
  )
}

