import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { useRefundMutation } from '../hooks'

export function RefundManagerForm() {
  const [paymentId, setPaymentId] = useState('')
  const [reason, setReason] = useState('')
  const { mutate: refund, isPending } = useRefundMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refund({ paymentId, reason })
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Refund Manager</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment ID"
          placeholder="Enter payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refund Reason
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you issuing this refund?"
          />
        </div>
        <Button type="submit" fullWidth loading={isPending} disabled={isPending}>
          Process Refund
        </Button>
      </form>
    </Card>
  )
}

