import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'

export function PaymentRequestForm() {
  const [requestData, setRequestData] = useState({
    amount: '',
    description: '',
    expiresIn: '24',
  })

  const [generatedLink, setGeneratedLink] = useState('')

  const handleGenerate = () => {
    const link = `${window.location.origin}/pay?amount=${requestData.amount}&desc=${requestData.description}`
    setGeneratedLink(link)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Create Payment Request</h2>
      <div className="space-y-4">
        <Input
          label="Amount"
          type="number"
          value={requestData.amount}
          onChange={(e) =>
            setRequestData({ ...requestData, amount: e.target.value })
          }
        />
        <Input
          label="Description"
          value={requestData.description}
          onChange={(e) =>
            setRequestData({ ...requestData, description: e.target.value })
          }
        />
        <Input
          label="Expires In (hours)"
          type="number"
          value={requestData.expiresIn}
          onChange={(e) =>
            setRequestData({ ...requestData, expiresIn: e.target.value })
          }
        />

        <Button onClick={handleGenerate} fullWidth>
          Generate Payment Link
        </Button>

        {generatedLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Share this link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
              />
              <Button onClick={copyLink} variant="outline">
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

