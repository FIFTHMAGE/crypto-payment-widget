import React from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { Address } from 'viem'
import { Card } from '../../../components/ui'
import { PaymentForm } from './PaymentForm'
import { TransactionStatus } from './TransactionStatus'
import { WalletConnect } from '../../wallet/components/WalletConnect'
import { usePayment } from '../hooks'

interface SimplePaymentProps {
  defaultAmount?: string
  defaultRecipient?: string
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export const SimplePayment: React.FC<SimplePaymentProps> = ({
  defaultAmount,
  defaultRecipient,
  onSuccess,
  onError,
}) => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { sendPayment, hash, isLoading, isSuccess, error } = usePayment()

  React.useEffect(() => {
    if (isSuccess && hash) {
      onSuccess?.(hash)
    }
  }, [isSuccess, hash, onSuccess])

  React.useEffect(() => {
    if (error) {
      onError?.(new Error(error))
    }
  }, [error, onError])

  const handlePayment = (amount: string, recipient: Address) => {
    sendPayment(recipient, amount)
  }

  if (!isConnected) {
    return (
      <Card>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-gray-600">
            Connect your wallet to start making payments
          </p>
          <WalletConnect />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Simple Payment
          </h3>
          <p className="text-sm text-gray-600">
            Direct wallet-to-wallet transfers
          </p>
        </div>

        <PaymentForm
          onSubmit={handlePayment}
          isLoading={isLoading}
          defaultAmount={defaultAmount}
          defaultRecipient={defaultRecipient}
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {hash && <TransactionStatus txHash={hash} chainId={chainId} />}
      </div>
    </Card>
  )
}

