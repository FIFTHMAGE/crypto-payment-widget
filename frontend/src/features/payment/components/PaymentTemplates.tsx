import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'
import { useUIStore } from '../../../store'
import { AddressDisplay, AmountDisplay } from '../../../components/common'

interface PaymentTemplate {
  id: string
  name: string
  recipient: string
  amount: string
  token: string
  description: string
  category: string
  usageCount: number
  createdAt: number
}

const CATEGORIES = ['Personal', 'Business', 'Subscriptions', 'Utilities', 'Other']

export const PaymentTemplates = () => {
  const [templates, setTemplates] = useState<PaymentTemplate[]>([
    {
      id: '1',
      name: 'Monthly Rent',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      amount: '1.5',
      token: 'ETH',
      description: 'Apartment rent payment',
      category: 'Utilities',
      usageCount: 12,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
  ])

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    recipient: '',
    amount: '',
    token: 'ETH',
    description: '',
    category: 'Personal',
  })

  const [showForm, setShowForm] = useState(false)
  const { addToast } = useUIStore()

  const handleCreate = () => {
    if (!newTemplate.name || !newTemplate.recipient || !newTemplate.amount) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    const template: PaymentTemplate = {
      id: `template-${Date.now()}`,
      ...newTemplate,
      usageCount: 0,
      createdAt: Date.now(),
    }

    setTemplates([...templates, template])
    setNewTemplate({
      name: '',
      recipient: '',
      amount: '',
      token: 'ETH',
      description: '',
      category: 'Personal',
    })
    setShowForm(false)
    addToast('Template created successfully!', 'success')
  }

  const handleUse = (template: PaymentTemplate) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      )
    )
    addToast(`Using template: ${template.name}`, 'success')
    // TODO: Pre-fill payment form with template data
  }

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
    addToast('Template deleted', 'info')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Templates</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Template'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>

          <div className="space-y-4">
            <Input
              label="Template Name *"
              placeholder="e.g., Monthly Rent"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />

            <Input
              label="Recipient Address *"
              placeholder="0x..."
              value={newTemplate.recipient}
              onChange={(e) => setNewTemplate({ ...newTemplate, recipient: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount *"
                type="number"
                placeholder="0.0"
                value={newTemplate.amount}
                onChange={(e) => setNewTemplate({ ...newTemplate, amount: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <Select
                  value={newTemplate.token}
                  onChange={(e) => setNewTemplate({ ...newTemplate, token: e.target.value })}
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="DAI">DAI</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>

            <Input
              label="Description"
              placeholder="What is this payment for?"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            />

            <Button onClick={handleCreate} fullWidth>
              Create Template
            </Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} padding="sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold">{template.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-600">To:</p>
                <AddressDisplay address={template.recipient} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Amount:</p>
                <p className="font-medium">
                  <AmountDisplay amount={template.amount} symbol={template.token} />
                </p>
              </div>
              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Used {template.usageCount} times</span>
              <span>{new Date(template.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleUse(template)} fullWidth>
                Use Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(template.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No templates yet</p>
            <Button onClick={() => setShowForm(true)}>Create Your First Template</Button>
          </div>
        </Card>
      )}
    </div>
  )
}



