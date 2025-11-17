import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function RecurringPaymentForm() {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    frequency: 'monthly' as Frequency,
    startDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating recurring payment:', formData)
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Recurring Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Recipient"
          placeholder="0x..."
          value={formData.recipient}
          onChange={(e) =>
            setFormData({ ...formData, recipient: e.target.value })
          }
        />
        <Input
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <Select
            value={formData.frequency}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value as Frequency })
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </div>
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
        />
        <Button type="submit" fullWidth>
          Schedule Recurring Payment
        </Button>
      </form>
    </Card>
  )
}

