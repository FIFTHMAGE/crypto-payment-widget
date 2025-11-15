import { useState } from 'react'
import { Card, Button, Input, Textarea } from '../../../components/ui'
import { AddressDisplay, AmountDisplay, StatusBadge } from '../../../components/common'
import { usePaymentStore } from '../../../store'
import { useUIStore } from '../../../store'

interface RefundRequest {
  id: string
  transactionHash: string
  originalAmount: string
  refundAmount: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  requestedAt: number
  processedAt?: number
}

export const RefundManager = () => {
  const { transactions } = usePaymentStore()
  const { addToast } = useUIStore()

  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [selectedTx, setSelectedTx] = useState<string>('')
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [isPartial, setIsPartial] = useState(false)

  const handleRequestRefund = () => {
    if (!selectedTx || !refundAmount || !reason) {
      addToast('Please fill in all fields', 'error')
      return
    }

    const tx = transactions.find(t => t.hash === selectedTx)
    if (!tx) {
      addToast('Transaction not found', 'error')
      return
    }

    const refund: RefundRequest = {
      id: `refund-${Date.now()}`,
      transactionHash: selectedTx,
      originalAmount: tx.amount,
      refundAmount: refundAmount,
      reason,
      status: 'pending',
      requestedAt: Date.now(),
    }

    setRefunds([refund, ...refunds])
    setSelectedTx('')
    setRefundAmount('')
    setReason('')
    setIsPartial(false)
    addToast('Refund request submitted', 'success')
  }

  const handleProcessRefund = (refundId: string, approved: boolean) => {
    setRefunds(prev =>
      prev.map(r =>
        r.id === refundId
          ? {
              ...r,
              status: approved ? 'processed' : 'rejected',
              processedAt: Date.now(),
            }
          : r
      )
    )
    addToast(
      approved ? 'Refund processed successfully' : 'Refund rejected',
      approved ? 'success' : 'info'
    )
  }

  const eligibleTransactions = transactions.filter(tx => tx.status === 'confirmed')

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Request Refund</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Transaction
            </label>
            <select
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              value={selectedTx}
              onChange={(e) => {
                setSelectedTx(e.target.value)
                const tx = transactions.find(t => t.hash === e.target.value)
                if (tx) setRefundAmount(tx.amount)
              }}
            >
              <option value="">Select a transaction...</option>
              {eligibleTransactions.map((tx) => (
                <option key={tx.hash} value={tx.hash}>
                  {tx.hash.slice(0, 20)}... - {tx.amount} ETH
                </option>
              ))}
            </select>
          </div>

          {selectedTx && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="partial-refund"
                  checked={isPartial}
                  onChange={(e) => setIsPartial(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="partial-refund" className="text-sm">
                  Partial refund
                </label>
              </div>

              <Input
                label="Refund Amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                disabled={!isPartial}
              />

              <Textarea
                label="Reason for Refund"
                placeholder="Please explain why you're requesting a refund..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />

              <Button onClick={handleRequestRefund} fullWidth>
                Submit Refund Request
              </Button>
            </>
          )}
        </div>
      </Card>

      {refunds.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Refund Requests</h3>

          <div className="space-y-4">
            {refunds.map((refund) => (
              <div key={refund.id} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">Refund Request</p>
                      <StatusBadge status={refund.status} />
                    </div>
                    <p className="text-sm text-gray-600 break-all">
                      Transaction: {refund.transactionHash}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Original Amount</p>
                    <AmountDisplay amount={refund.originalAmount} symbol="ETH" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Refund Amount</p>
                    <AmountDisplay amount={refund.refundAmount} symbol="ETH" />
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Reason:</p>
                  <p className="text-sm">{refund.reason}</p>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Requested: {new Date(refund.requestedAt).toLocaleString()}
                  {refund.processedAt && (
                    <> · Processed: {new Date(refund.processedAt).toLocaleString()}</>
                  )}
                </div>

                {refund.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleProcessRefund(refund.id, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProcessRefund(refund.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}



