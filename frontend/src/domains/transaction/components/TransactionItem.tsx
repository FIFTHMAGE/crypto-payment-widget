import { AddressDisplay, AmountDisplay } from '../../../components/common'
import type { Transaction } from '../types'

interface TransactionItemProps {
  transaction: Transaction
  onViewDetails?: (txHash: string) => void
}

export function TransactionItem({
  transaction,
  onViewDetails,
}: TransactionItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓'
      case 'pending':
        return '⏳'
      case 'failed':
        return '✗'
      default:
        return '•'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
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
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
          >
            {getStatusIcon(transaction.status)}
          </span>
          <AddressDisplay
            address={transaction.hash}
            type="tx"
            length="short"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            <span className="text-xs">From:</span>{' '}
            <AddressDisplay address={transaction.from} length="short" />
          </div>
          <div>
            <span className="text-xs">To:</span>{' '}
            <AddressDisplay address={transaction.to} length="short" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <AmountDisplay
            amount={transaction.value}
            symbol={transaction.tokenSymbol || 'ETH'}
            className="font-semibold"
          />
          {transaction.timestamp && (
            <p className="text-xs text-gray-500">
              {new Date(transaction.timestamp * 1000).toLocaleString()}
            </p>
          )}
        </div>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(transaction.hash)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            View
          </button>
        )}
      </div>
    </div>
  )
}

