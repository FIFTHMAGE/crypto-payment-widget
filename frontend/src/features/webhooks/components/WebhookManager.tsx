import { useState } from 'react'
import { Card, Button, Input, Checkbox } from '../../../components/ui'
import { useUIStore } from '../../../store'

interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  secret: string
  createdAt: number
}

const AVAILABLE_EVENTS = [
  'payment.created',
  'payment.confirmed',
  'payment.failed',
  'escrow.created',
  'escrow.released',
  'escrow.refunded',
]

export const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
  })
  const { addToast } = useUIStore()

  const handleCreate = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      addToast('Please enter URL and select events', 'error')
      return
    }

    const webhook: Webhook = {
      id: `wh-${Date.now()}`,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      secret: `whsec_${Math.random().toString(36).substring(2)}`,
      createdAt: Date.now(),
    }

    setWebhooks([...webhooks, webhook])
    setNewWebhook({ url: '', events: [] })
    addToast('Webhook created successfully!', 'success')
  }

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }))
  }

  const toggleWebhook = (id: string) => {
    setWebhooks(prev =>
      prev.map(wh => (wh.id === id ? { ...wh, active: !wh.active } : wh))
    )
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(wh => wh.id !== id))
    addToast('Webhook deleted', 'info')
  }

  const testWebhook = async (webhook: Webhook) => {
    addToast('Sending test payload...', 'info')

    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 1000))
      addToast('Test payload sent successfully!', 'success')
    } catch (error) {
      addToast('Failed to send test payload', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Create New Webhook</h3>

        <div className="space-y-4">
          <Input
            label="Webhook URL"
            placeholder="https://example.com/webhook"
            value={newWebhook.url}
            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscribe to Events
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <Checkbox
                  key={event}
                  label={event}
                  checked={newWebhook.events.includes(event)}
                  onChange={() => toggleEvent(event)}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} fullWidth>
            Create Webhook
          </Button>
        </div>
      </Card>

      {webhooks.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Active Webhooks</h3>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium break-all">{webhook.url}</p>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          webhook.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {webhook.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Created {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Secret:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                    {webhook.secret}
                  </code>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(webhook)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWebhook(webhook.id)}
                  >
                    {webhook.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

