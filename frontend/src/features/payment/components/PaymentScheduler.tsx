import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'
import { AddressDisplay, AmountDisplay } from '../../../components/common'
import { useUIStore } from '../../../store'

interface ScheduledPayment {
  id: string
  recipient: string
  amount: string
  token: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextExecution: number
  lastExecution?: number
  executions: number
  maxExecutions?: number
  active: boolean
  createdAt: number
}

export const PaymentScheduler = () => {
  const [schedules, setSchedules] = useState<ScheduledPayment[]>([])
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: 'ETH',
    frequency: 'monthly' as const,
    startDate: '',
    maxExecutions: '',
  })

  const { addToast } = useUIStore()

  const handleCreate = () => {
    if (!formData.recipient || !formData.amount || !formData.startDate) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    const startDate = new Date(formData.startDate).getTime()
    if (startDate < Date.now()) {
      addToast('Start date must be in the future', 'error')
      return
    }

    const schedule: ScheduledPayment = {
      id: `schedule-${Date.now()}`,
      recipient: formData.recipient,
      amount: formData.amount,
      token: formData.token,
      frequency: formData.frequency,
      nextExecution: startDate,
      executions: 0,
      maxExecutions: formData.maxExecutions ? parseInt(formData.maxExecutions) : undefined,
      active: true,
      createdAt: Date.now(),
    }

    setSchedules([schedule, ...schedules])
    setFormData({
      recipient: '',
      amount: '',
      token: 'ETH',
      frequency: 'monthly',
      startDate: '',
      maxExecutions: '',
    })
    setShowForm(false)
    addToast('Scheduled payment created!', 'success')
  }

  const handleToggleActive = (id: string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
    )
  }

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
    addToast('Schedule deleted', 'info')
  }

  const getFrequencyText = (frequency: string) => {
    const map: Record<string, string> = {
      once: 'One-time',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    }
    return map[frequency] || frequency
  }

  const getNextExecutionDate = (schedule: ScheduledPayment) => {
    return new Date(schedule.nextExecution).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scheduled Payments</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Schedule'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Create Schedule</h3>

          <div className="space-y-4">
            <Input
              label="Recipient Address *"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount *"
                type="number"
                placeholder="0.0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <Select
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="DAI">DAI</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <Select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
              >
                <option value="once">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>

            <Input
              label="Start Date *"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            {formData.frequency !== 'once' && (
              <Input
                label="Max Executions (Optional)"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.maxExecutions}
                onChange={(e) => setFormData({ ...formData, maxExecutions: e.target.value })}
              />
            )}

            <Button onClick={handleCreate} fullWidth>
              Create Schedule
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{getFrequencyText(schedule.frequency)} Payment</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      schedule.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {schedule.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">To:</p>
                <AddressDisplay address={schedule.recipient} />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Amount:</p>
                <AmountDisplay amount={schedule.amount} symbol={schedule.token} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Next Execution</p>
                <p className="font-medium">{getNextExecutionDate(schedule)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Executions</p>
                <p className="font-medium">
                  {schedule.executions}
                  {schedule.maxExecutions && ` / ${schedule.maxExecutions}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Last Execution</p>
                <p className="font-medium">
                  {schedule.lastExecution
                    ? new Date(schedule.lastExecution).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="font-medium">{new Date(schedule.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={schedule.active ? 'outline' : 'primary'}
                onClick={() => handleToggleActive(schedule.id)}
              >
                {schedule.active ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" variant="outline">
                Execute Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(schedule.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && !showForm && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No scheduled payments</p>
            <Button onClick={() => setShowForm(true)}>Create Your First Schedule</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

