import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'
import { AddressDisplay } from '../../../components/common'
import { useUIStore } from '../../../store'

interface RecurringPaymentProps {
  onSchedule?: (config: RecurringConfig) => void
}

interface RecurringConfig {
  recipient: string
  amount: string
  token: string
  interval: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate?: string
  maxPayments?: number
}

export const RecurringPayment = ({ onSchedule }: RecurringPaymentProps) => {
  const [config, setConfig] = useState<RecurringConfig>({
    recipient: '',
    amount: '',
    token: '0x0000000000000000000000000000000000000000',
    interval: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  })
  const [activeSchedules, setActiveSchedules] = useState<RecurringConfig[]>([])
  const { addToast } = useUIStore()

  const handleSchedule = () => {
    if (!config.recipient || !config.amount) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    setActiveSchedules([...activeSchedules, config])
    onSchedule?.(config)
    addToast('Recurring payment scheduled!', 'success')

    // Reset form
    setConfig({
      ...config,
      recipient: '',
      amount: '',
    })
  }

  const handleCancel = (index: number) => {
    setActiveSchedules(activeSchedules.filter((_, i) => i !== index))
    addToast('Schedule cancelled', 'info')
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Schedule Recurring Payment</h3>

        <div className="space-y-4">
          <Input
            label="Recipient Address"
            placeholder="0x..."
            value={config.recipient}
            onChange={(e) => setConfig({ ...config, recipient: e.target.value })}
          />

          <Input
            label="Amount"
            type="number"
            placeholder="0.0"
            value={config.amount}
            onChange={(e) => setConfig({ ...config, amount: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <Select
              value={config.interval}
              onChange={(e) => setConfig({ ...config, interval: e.target.value as any })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
          />

          <Input
            label="End Date (Optional)"
            type="date"
            value={config.endDate || ''}
            onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
          />

          <Input
            label="Max Payments (Optional)"
            type="number"
            placeholder="e.g., 12"
            value={config.maxPayments || ''}
            onChange={(e) => setConfig({ ...config, maxPayments: Number(e.target.value) })}
          />

          <Button onClick={handleSchedule} fullWidth>
            Schedule Payment
          </Button>
        </div>
      </Card>

      {activeSchedules.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Active Schedules</h3>

          <div className="space-y-3">
            {activeSchedules.map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AddressDisplay address={schedule.recipient} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {schedule.amount} ETH · {schedule.interval} · 
                    Starts {new Date(schedule.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancel(index)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

