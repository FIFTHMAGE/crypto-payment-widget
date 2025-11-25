import type { Payment } from '../types'
import { AddressDisplay, AmountDisplay } from '../../../components/common'
import { Card, Button } from '../../../components/ui'

interface PaymentReceiptViewProps {
  payment: Payment
}

export function PaymentReceiptView({ payment }: PaymentReceiptViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Payment Receipt</h1>
        <p className="text-gray-600">Transaction #{payment.id.slice(0, 8)}</p>
      </div>

      <div className="border-t border-b border-gray-200 py-6 my-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">From:</span>
          <AddressDisplay address={payment.payer} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">To:</span>
          <AddressDisplay address={payment.payee} />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <AmountDisplay
            amount={payment.amount}
            symbol={payment.token || 'ETH'}
            className="font-bold text-xl"
          />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-semibold capitalize">{payment.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span>{new Date(payment.timestamp * 1000).toLocaleString()}</span>
        </div>
        {payment.txHash && (
          <div className="flex justify-between">
            <span className="text-gray-600">Tx Hash:</span>
            <AddressDisplay address={payment.txHash} type="tx" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePrint} fullWidth>
          Print Receipt
        </Button>
        <Button variant="outline" fullWidth>
          Download PDF
        </Button>
      </div>
    </Card>
  )
}

