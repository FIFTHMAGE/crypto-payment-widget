import React from 'react'
import { Card, Spinner } from '../../../components/ui'
import { AddressDisplay, AmountDisplay, StatusBadge } from '../../../components/common'
import { usePaymentHistory } from '../hooks'
import { formatDate } from '../../../lib/utils'
import { blockchainService } from '../../../services'

export const PaymentHistory: React.FC = () => {
  const { payments, loading, error, refresh } = usePaymentHistory({
    limit: 10,
    offset: 0,
  })

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 text-primary-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Payments Yet
          </h3>
          <p className="text-gray-600">
            Your payment history will appear here
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment History
        </h3>
        <button
          onClick={refresh}
          className="text-sm text-primary-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={payment.status} />
                <span className="text-sm text-gray-500">
                  {formatDate(payment.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600">From:</span>{' '}
                  <AddressDisplay address={payment.from} length={4} showBadge />
                </div>
                <div>
                  <span className="text-gray-600">To:</span>{' '}
                  <AddressDisplay address={payment.to} length={4} showBadge />
                </div>
              </div>
            </div>
            <div className="text-right">
              <AmountDisplay amount={payment.amount} />
              <a
                href={blockchainService.getTransactionUrl(payment.txHash, 1)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-primary-600 hover:underline mt-1"
              >
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

