import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'

export function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    billTo: '',
    items: [{ description: '', amount: '' }],
  })

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', amount: '' }],
    })
  }

  const handleGenerate = () => {
    console.log('Generating invoice:', invoiceData)
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Generate Invoice</h2>
      <div className="space-y-4">
        <Input
          label="Invoice Number"
          value={invoiceData.invoiceNumber}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })
          }
        />
        <Input
          label="Bill To"
          placeholder="0x..."
          value={invoiceData.billTo}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, billTo: e.target.value })
          }
        />

        <div>
          <h3 className="font-semibold mb-2">Line Items</h3>
          {invoiceData.items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => {
                  const newItems = [...invoiceData.items]
                  newItems[index].description = e.target.value
                  setInvoiceData({ ...invoiceData, items: newItems })
                }}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => {
                  const newItems = [...invoiceData.items]
                  newItems[index].amount = e.target.value
                  setInvoiceData({ ...invoiceData, items: newItems })
                }}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}>
            + Add Item
          </Button>
        </div>

        <Button onClick={handleGenerate} fullWidth>
          Generate Invoice
        </Button>
      </div>
    </Card>
  )
}

