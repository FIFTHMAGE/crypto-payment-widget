import React, { useState } from 'react'
import type { Address } from 'viem'
import { Input, Button } from '../../../components/ui'
import { validatePayment } from '../../../lib/utils'

interface PaymentFormProps {
  onSubmit: (amount: string, recipient: Address) => void
  isLoading?: boolean
  defaultAmount?: string
  defaultRecipient?: string
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultAmount = '0.01',
  defaultRecipient = '',
}) => {
  const [amount, setAmount] = useState(defaultAmount)
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validatePayment(amount, recipient)
    if (!validation.isValid) {
      const errorMap = validation.errors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {} as Record<string, string>)
      setErrors(errorMap)
      return
    }

    setErrors({})
    onSubmit(amount, recipient as Address)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount (ETH)"
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.01"
        error={errors.amount}
        disabled={isLoading}
      />

      <Input
        label="Recipient Address"
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="0x..."
        error={errors.address}
        disabled={isLoading}
        className="font-mono text-sm"
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        {isLoading ? 'Processing...' : `Pay ${amount} ETH`}
      </Button>
    </form>
  )
}

