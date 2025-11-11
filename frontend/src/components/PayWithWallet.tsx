import React, { useState } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, type Address } from 'viem'

export interface PayWithWalletProps {
  amount: string // Amount in ETH or native token
  recipient: string // Recipient address
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  onTransactionLogged?: (data: any) => void
  className?: string
  disabled?: boolean
}

export const PayWithWallet: React.FC<PayWithWalletProps> = ({
  amount,
  recipient,
  onSuccess,
  onError,
  onTransactionLogged,
  className = '',
  disabled = false,
}) => {
  const { address, isConnected } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { sendTransaction, data: hash, isPending, error: sendError } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction success
  React.useEffect(() => {
    if (isConfirmed && hash) {
      setIsProcessing(false)
      setError(null)

      // Log transaction to backend
      if (address && recipient) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            txHash: hash,
            from: address,
            to: recipient,
            amount: amount,
            value: parseEther(amount).toString(),
            timestamp: new Date().toISOString(),
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to log transaction')
            }
            return response.json()
          })
          .then((data) => {
            onTransactionLogged?.(data)
          })
          .catch((logError) => {
            console.error('Failed to log transaction:', logError)
            // Don't fail the payment if logging fails
          })
      }

      onSuccess?.(hash)
    }
  }, [isConfirmed, hash, address, recipient, amount, onSuccess, onTransactionLogged])

  // Handle transaction errors
  React.useEffect(() => {
    if (sendError) {
      const error = new Error(sendError.message || 'Transaction failed')
      setError(error.message)
      setIsProcessing(false)
      onError?.(error)
    }
  }, [sendError, onError])

  const handlePayment = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Validate recipient address
      if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
        throw new Error('Invalid recipient address')
      }

      // Validate and parse amount
      const value = parseFloat(amount)
      if (isNaN(value) || value <= 0) {
        throw new Error('Invalid amount. Please enter a positive number.')
      }

      // Convert ETH to wei using viem
      const valueInWei = parseEther(amount)

      // Send transaction
      sendTransaction({
        to: recipient as Address,
        value: valueInWei,
      })
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
      setIsProcessing(false)
      onError?.(error)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Show connect button if not connected
  if (!isConnected) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <appkit-button />
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    )
  }

  // Show payment button when connected
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Connected: {formatAddress(address || '')}
          </span>
        </div>
        <appkit-button />
      </div>

      <button
        onClick={handlePayment}
        disabled={disabled || isPending || isConfirming || isProcessing}
        className={`
          px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg
          hover:bg-primary-700 active:bg-primary-800
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200
          flex items-center justify-center gap-2
          ${isPending || isConfirming || isProcessing ? 'opacity-75' : ''}
        `}
      >
        {(isPending || isConfirming || isProcessing) ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : 'Processing...'}
          </>
        ) : (
          `Pay ${amount} ETH`
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {hash && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-mono text-blue-700 break-all">
            Transaction: {hash}
          </p>
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  )
}

export default PayWithWallet
