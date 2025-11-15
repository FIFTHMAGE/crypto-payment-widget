import { useState } from 'react'
import { Card, Button, Input } from '../../../components/ui'
import { validateEthereumAddress, validateAmount } from '../../../core/validation'
import { usePaymentMutation } from '../hooks'
import { useAccount } from 'wagmi'

interface SimplePaymentFormProps {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export function SimplePaymentForm({ onSuccess, onError }: SimplePaymentFormProps) {
  const { address, isConnected } = useAccount()
  const { mutate: createPayment, isPending } = usePaymentMutation()

  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.recipient) {
      newErrors.recipient = 'Recipient address is required'
    } else if (!validateEthereumAddress(formData.recipient)) {
      newErrors.recipient = 'Invalid Ethereum address'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else {
      const amountValidation = validateAmount(formData.amount, '0.001', '1000')
      if (!amountValidation.valid) {
        newErrors.amount = amountValidation.error || 'Invalid amount'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      onError?.(new Error('Please connect your wallet first'))
      return
    }

    if (!validateForm()) return

    createPayment(
      {
        payee: formData.recipient,
        amount: formData.amount,
        metadata: formData.description ? { description: formData.description } : undefined,
      },
      {
        onSuccess: (data) => {
          onSuccess?.(data.txHash)
          // Reset form
          setFormData({ recipient: '', amount: '', description: '' })
        },
        onError: (error) => {
          onError?.(error instanceof Error ? error : new Error('Payment failed'))
        },
      }
    )
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Simple Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Recipient Address"
          placeholder="0x..."
          value={formData.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          error={errors.recipient}
          required
        />

        <Input
          label="Amount (ETH)"
          type="number"
          step="0.001"
          placeholder="0.0"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={errors.amount}
          required
        />

        <Input
          label="Description (Optional)"
          placeholder="What is this payment for?"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <Button
          type="submit"
          fullWidth
          disabled={!isConnected || isPending}
          loading={isPending}
        >
          {isPending ? 'Processing...' : 'Send Payment'}
        </Button>

        {!isConnected && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to make a payment
          </p>
        )}
      </form>
    </Card>
  )
}

