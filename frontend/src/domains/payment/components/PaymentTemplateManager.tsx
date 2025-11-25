import { useState } from 'react'
import type { PaymentTemplate } from '../types'
import { Card, Button, Input } from '../../../components/ui'
import { usePaymentStore } from '../store'

export function PaymentTemplateManager() {
  const { templates, addTemplate, deleteTemplate, incrementTemplateUsage } =
    usePaymentStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    recipient: '',
    amount: '',
    token: 'ETH',
    category: 'Personal',
  })

  const handleCreate = () => {
    const template: PaymentTemplate = {
      id: `template_${Date.now()}`,
      ...formData,
      description: '',
      usageCount: 0,
      createdAt: Date.now(),
    }
    addTemplate(template)
    setFormData({
      name: '',
      recipient: '',
      amount: '',
      token: 'ETH',
      category: 'Personal',
    })
    setShowForm(false)
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
          <h3 className="text-lg font-semibold mb-4">Create Template</h3>
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              label="Recipient"
              value={formData.recipient}
              onChange={(e) =>
                setFormData({ ...formData, recipient: e.target.value })
              }
            />
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
            <Button onClick={handleCreate} fullWidth>
              Create Template
            </Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <h3 className="font-semibold mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {template.amount} {template.token}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => incrementTemplateUsage(template.id)}
                fullWidth
              >
                Use
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteTemplate(template.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

