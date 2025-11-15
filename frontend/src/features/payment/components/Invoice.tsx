import { useState } from 'react'
import { Card, Button, Input, Textarea } from '../../../components/ui'
import { QRCodeGenerator } from './QRCodeGenerator'
import { AddressDisplay, AmountDisplay } from '../../../components/common'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: string
  total: string
}

interface InvoiceProps {
  from?: string
  to?: string
}

export const Invoice = ({ from, to }: InvoiceProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: '0', total: '0' },
  ])
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`)
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: '0', total: '0' }])
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Recalculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice
      newItems[index].total = (Number(quantity) * Number(unitPrice)).toFixed(2)
    }

    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total), 0).toFixed(2)
  }

  const handleExport = () => {
    const invoiceData = {
      invoiceNumber,
      from,
      to,
      dueDate,
      items,
      total: calculateTotal(),
      notes,
      createdAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceNumber}.json`
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Invoice</h2>
            <p className="text-gray-600">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">From</h3>
            {from ? (
              <AddressDisplay address={from} />
            ) : (
              <p className="text-gray-500">Connect wallet</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">To</h3>
            <Input
              placeholder="Recipient address"
              value={to || ''}
              readOnly={!!to}
            />
          </div>
        </div>

        <div className="mb-6">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input value={item.total} readOnly />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="mt-3">
            + Add Item
          </Button>
        </div>

        <div className="mb-6">
          <Textarea
            label="Notes"
            placeholder="Additional notes or payment instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <AmountDisplay amount={calculateTotal()} symbol="ETH" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleExport} variant="outline">
            Export JSON
          </Button>
          <Button fullWidth>Send Invoice</Button>
        </div>
      </Card>

      {to && (
        <QRCodeGenerator
          address={to}
          amount={calculateTotal()}
          label={`Invoice #${invoiceNumber}`}
        />
      )}
    </div>
  )
}

