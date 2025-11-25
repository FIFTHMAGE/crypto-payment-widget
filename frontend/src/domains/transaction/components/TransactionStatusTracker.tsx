import { AddressDisplay } from '../../../components/common'
import { Card } from '../../../components/ui'
import { useTransaction } from '../hooks'

interface TransactionStatusTrackerProps {
  txHash: string
}

export function TransactionStatusTracker({ txHash }: TransactionStatusTrackerProps) {
  const { data: transaction, isLoading } = useTransaction(txHash)

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (!transaction) {
    return (
      <Card>
        <p className="text-gray-500">Transaction not found</p>
      </Card>
    )
  }

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }[transaction.status] || 'bg-gray-100 text-gray-800'

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Transaction Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {transaction.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-600">Transaction Hash</p>
            <AddressDisplay address={transaction.hash} type="tx" showCopy />
          </div>
          
          {transaction.blockNumber && (
            <div>
              <p className="text-xs text-gray-600">Block Number</p>
              <p className="font-mono">{transaction.blockNumber}</p>
            </div>
          )}
          
          {transaction.confirmations !== undefined && (
            <div>
              <p className="text-xs text-gray-600">Confirmations</p>
              <p className="font-mono">{transaction.confirmations}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

