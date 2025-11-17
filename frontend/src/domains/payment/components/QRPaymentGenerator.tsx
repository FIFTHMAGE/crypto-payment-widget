import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'

export function QRPaymentGenerator() {
  const [paymentData, setPaymentData] = useState({
    recipient: '',
    amount: '',
    memo: '',
  })

  const generateQR = () => {
    const data = `ethereum:${paymentData.recipient}?value=${paymentData.amount}&memo=${paymentData.memo}`
    console.log('QR Data:', data)
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Generate Payment QR Code</h2>
      <div className="space-y-4">
        <Input
          label="Recipient Address"
          value={paymentData.recipient}
          onChange={(e) =>
            setPaymentData({ ...paymentData, recipient: e.target.value })
          }
        />
        <Input
          label="Amount"
          type="number"
          value={paymentData.amount}
          onChange={(e) =>
            setPaymentData({ ...paymentData, amount: e.target.value })
          }
        />
        <Input
          label="Memo"
          value={paymentData.memo}
          onChange={(e) =>
            setPaymentData({ ...paymentData, memo: e.target.value })
          }
        />
        <Button onClick={generateQR} fullWidth>
          Generate QR Code
        </Button>
        <div className="mt-4 p-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">QR Code will appear here</div>
        </div>
      </div>
    </Card>
  )
}

