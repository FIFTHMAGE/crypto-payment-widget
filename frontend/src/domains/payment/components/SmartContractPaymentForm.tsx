import { useState } from 'react'
import { Card, Button, Input, Select } from '../../../components/ui'
import { validateEthereumAddress, validateAmount } from '../../../core/validation'
import { useAccount } from 'wagmi'
import { useWriteContract } from 'wagmi'
import PaymentProcessorABI from '../../../contracts/PaymentProcessor.json'
import { config } from '../../../core/config'

interface SmartContractPaymentFormProps {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export function SmartContractPaymentForm({
  onSuccess,
  onError,
}: SmartContractPaymentFormProps) {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    token: '0x0000000000000000000000000000000000000000', // ETH
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validateEthereumAddress(formData.recipient)) {
      newErrors.recipient = 'Invalid recipient address'
    }

    const amountValidation = validateAmount(formData.amount, '0.001')
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      onError?.(new Error('Please connect your wallet'))
      return
    }

    if (!validateForm()) return

    try {
      writeContract(
        {
          address: config.paymentProcessorAddress as `0x${string}`,
          abi: PaymentProcessorABI.abi,
          functionName: 'processPayment',
          args: [
            formData.recipient,
            formData.token,
            BigInt(parseFloat(formData.amount) * 1e18),
            formData.description || '',
          ],
          value: BigInt(parseFloat(formData.amount) * 1e18),
        },
        {
          onSuccess: (hash) => {
            onSuccess?.(hash)
            setFormData({
              recipient: '',
              amount: '',
              token: '0x0000000000000000000000000000000000000000',
              description: '',
            })
          },
          onError: (error) => {
            onError?.(error)
          },
        }
      )
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Transaction failed'))
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Smart Contract Payment</h2>

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
          label="Amount"
          type="number"
          step="0.001"
          placeholder="0.0"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={errors.amount}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <Select
            value={formData.token}
            onChange={(e) => handleChange('token', e.target.value)}
          >
            <option value="0x0000000000000000000000000000000000000000">
              ETH (Native)
            </option>
          </Select>
        </div>

        <Input
          label="Description (Optional)"
          placeholder="Payment description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Smart Contract Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ On-chain payment tracking</li>
            <li>✓ Platform fee: 0.25%</li>
            <li>✓ Escrow support available</li>
          </ul>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={!isConnected || isPending}
          loading={isPending}
        >
          {isPending ? 'Processing...' : 'Pay via Smart Contract'}
        </Button>
      </form>
    </Card>
  )
}

