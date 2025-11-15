import { useEffect, useRef } from 'react'
import { Card, Button } from '../../../components/ui'
import { useCopyToClipboard } from '../../../lib/hooks'
import { useUIStore } from '../../../store'

interface QRCodeGeneratorProps {
  address: string
  amount?: string
  token?: string
  label?: string
}

export const QRCodeGenerator = ({ address, amount, token, label }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [, copy] = useCopyToClipboard()
  const { addToast } = useUIStore()

  const paymentUrl = `ethereum:${address}${amount ? `?value=${amount}` : ''}${
    token ? `&token=${token}` : ''
  }`

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code using canvas
      // For now, just draw a placeholder
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, 200, 200)
        ctx.fillStyle = '#fff'
        ctx.font = '12px monospace'
        ctx.fillText('QR Code', 70, 100)
        ctx.fillText('Placeholder', 60, 115)
      }
    }
  }, [address, amount, token])

  const handleCopy = async () => {
    await copy(paymentUrl)
    addToast('Payment link copied!', 'success')
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `payment-qr-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  return (
    <Card>
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-semibold">Payment QR Code</h3>
        
        {label && (
          <p className="text-sm text-gray-600">{label}</p>
        )}

        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="border-2 border-gray-200 rounded"
        />

        <div className="text-xs text-gray-500 max-w-xs break-all text-center">
          {paymentUrl}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>
    </Card>
  )
}

