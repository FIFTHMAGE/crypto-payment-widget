import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { QRCodeGenerator } from './QRCodeGenerator'
import { useAccount } from 'wagmi'
import { useCopyToClipboard } from '../../../lib/hooks'
import { useUIStore } from '../../../store'

export const PaymentRequest = () => {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [, copy] = useCopyToClipboard()
  const { addToast } = useUIStore()

  const handleGenerate = () => {
    if (!address || !amount) {
      addToast('Please connect wallet and enter amount', 'error')
      return
    }

    const link = `${window.location.origin}/pay?to=${address}&amount=${amount}${
      description ? `&desc=${encodeURIComponent(description)}` : ''
    }`
    setGeneratedLink(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Please send ${amount} ETH${description ? ` for ${description}` : ''}`,
          url: generatedLink,
        })
      } catch (err) {
        // User cancelled or share not supported
      }
    } else {
      await copy(generatedLink)
      addToast('Link copied to clipboard!', 'success')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Create Payment Request</h3>

        <div className="space-y-4">
          <Input
            label="Amount (ETH)"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Description (Optional)"
            placeholder="What is this payment for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button onClick={handleGenerate} fullWidth disabled={!address || !amount}>
            Generate Payment Link
          </Button>
        </div>
      </Card>

      {generatedLink && address && (
        <>
          <QRCodeGenerator address={address} amount={amount} label={description} />

          <Card>
            <h3 className="text-lg font-semibold mb-4">Share Payment Link</h3>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded text-sm break-all">
                {generatedLink}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare} fullWidth>
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await copy(generatedLink)
                    addToast('Link copied!', 'success')
                  }}
                  fullWidth
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

