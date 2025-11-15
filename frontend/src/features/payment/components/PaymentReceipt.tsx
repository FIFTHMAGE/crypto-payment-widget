import { useRef } from 'react'
import { Card, Button } from '../../../components/ui'
import { AddressDisplay, AmountDisplay, StatusBadge } from '../../../components/common'
import { formatTimestamp } from '../../../lib/utils/time'
import { useUIStore } from '../../../store'

interface Transaction {
  hash: string
  from: string
  to: string
  amount: string
  status: string
  timestamp: number
  blockNumber?: number
  gasUsed?: string
  gasPrice?: string
}

interface PaymentReceiptProps {
  transaction: Transaction
  onClose?: () => void
}

export const PaymentReceipt = ({ transaction, onClose }: PaymentReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { addToast } = useUIStore()

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    addToast('PDF download not yet implemented', 'info')
    // TODO: Implement PDF generation
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Receipt',
          text: `Payment of ${transaction.amount} ETH\nTransaction: ${transaction.hash}`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      addToast('Sharing not supported on this device', 'info')
    }
  }

  const calculateFee = () => {
    if (transaction.gasUsed && transaction.gasPrice) {
      const fee = (parseInt(transaction.gasUsed) * parseInt(transaction.gasPrice)) / 1e18
      return fee.toFixed(6)
    }
    return 'N/A'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Receipt</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Card ref={receiptRef}>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center pb-6 border-b">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Crypto Payment Widget</h1>
            <p className="text-gray-600">Official Payment Receipt</p>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <StatusBadge status={transaction.status} size="lg" />
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receipt Date</p>
                <p className="font-medium">{formatTimestamp(transaction.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-sm break-all">{transaction.hash.slice(0, 20)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">From</p>
                <AddressDisplay address={transaction.from} linkToExplorer chainId={1} />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">To</p>
                <AddressDisplay address={transaction.to} linkToExplorer chainId={1} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="text-2xl font-bold">
                  <AmountDisplay amount={transaction.amount} symbol="ETH" />
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Network Fee</span>
                <span>{calculateFee()} ETH</span>
              </div>

              {transaction.blockNumber && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Block Number</span>
                  <span>{transaction.blockNumber.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <AmountDisplay
                  amount={(parseFloat(transaction.amount) + parseFloat(calculateFee() || '0')).toFixed(6)}
                  symbol="ETH"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t text-center text-sm text-gray-600">
            <p>This receipt is valid for all accounting purposes</p>
            <p className="mt-2">
              Verified on Ethereum blockchain
            </p>
            <p className="mt-4 text-xs">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleShare}>
          Share
        </Button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-container, #receipt-container * {
            visibility: visible;
          }
          #receipt-container {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}

