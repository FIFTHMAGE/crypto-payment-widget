import React, { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { Address } from 'viem'
import { Card, Button, Input } from '../../../components/ui'
import { WalletConnect } from '../../wallet/components/WalletConnect'
import { TransactionStatus } from './TransactionStatus'
import { usePaymentContract } from '../hooks'

type PaymentMode = 'direct' | 'escrow' | 'split'

export const SmartContractPayment: React.FC = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mode, setMode] = useState<PaymentMode>('direct')
  const [amount, setAmount] = useState('0.01')
  const [recipient, setRecipient] = useState('')
  const [releaseTime, setReleaseTime] = useState('')

  const {
    processPayment,
    createEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = usePaymentContract(chainId)

  const handleDirectPayment = async () => {
    await processPayment({
      amount,
      recipient: recipient as Address,
      metadata: 'Direct smart contract payment',
    })
  }

  const handleEscrow = async () => {
    const releaseTimestamp = Math.floor(new Date(releaseTime).getTime() / 1000)
    await createEscrow(
      recipient as Address,
      amount,
      releaseTimestamp,
      'Escrow payment'
    )
  }

  if (!isConnected) {
    return (
      <Card>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-gray-600">
            Connect your wallet to use smart contract payments
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
            Smart Contract Payment
          </h3>
          <p className="text-sm text-gray-600">
            Advanced payment features with smart contracts
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'direct' ? 'primary' : 'outline'}
            onClick={() => setMode('direct')}
          >
            Direct
          </Button>
          <Button
            size="sm"
            variant={mode === 'escrow' ? 'primary' : 'outline'}
            onClick={() => setMode('escrow')}
          >
            Escrow
          </Button>
          <Button
            size="sm"
            variant={mode === 'split' ? 'primary' : 'outline'}
            onClick={() => setMode('split')}
            disabled
          >
            Split (Soon)
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            label="Amount (ETH)"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            disabled={isPending || isConfirming}
          />

          <Input
            label="Recipient Address"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isPending || isConfirming}
            className="font-mono text-sm"
          />

          {mode === 'escrow' && (
            <Input
              label="Release Time"
              type="datetime-local"
              value={releaseTime}
              onChange={(e) => setReleaseTime(e.target.value)}
              disabled={isPending || isConfirming}
            />
          )}

          <Button
            onClick={mode === 'escrow' ? handleEscrow : handleDirectPayment}
            isLoading={isPending || isConfirming}
            className="w-full"
          >
            {mode === 'escrow' ? 'Create Escrow' : 'Process Payment'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {hash && <TransactionStatus txHash={hash} chainId={chainId} />}
      </div>
    </Card>
  )
}

