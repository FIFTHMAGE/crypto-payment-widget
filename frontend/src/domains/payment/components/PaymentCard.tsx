import { Card } from '../../../components/ui'
import { AddressDisplay, AmountDisplay } from '../../../components/common'
import type { Payment } from '../types'

interface PaymentCardProps {
  payment: Payment
  onRefund?: (paymentId: string) => void
  onViewDetails?: (paymentId: string) => void
}

export function PaymentCard({
  payment,
  onRefund,
  onViewDetails,
}: PaymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment #{payment.id.slice(0, 8)}
          </h3>
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(payment.status)}`}
          >
            {payment.status.toUpperCase()}
          </span>
        </div>
        <AmountDisplay
          amount={payment.amount}
          symbol={payment.token || 'ETH'}
          className="text-2xl font-bold"
        />
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-gray-600">From:</p>
          <AddressDisplay address={payment.payer} />
        </div>
        <div>
          <p className="text-xs text-gray-600">To:</p>
          <AddressDisplay address={payment.payee} />
        </div>
        {payment.txHash && (
          <div>
            <p className="text-xs text-gray-600">Transaction:</p>
            <AddressDisplay address={payment.txHash} type="tx" />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(payment.id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
          >
            View Details
          </button>
        )}
        {onRefund && payment.status === 'completed' && (
          <button
            onClick={() => onRefund(payment.id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
          >
            Refund
          </button>
        )}
      </div>
    </Card>
  )
}

