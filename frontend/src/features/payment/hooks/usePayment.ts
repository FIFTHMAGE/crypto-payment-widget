import { useState, useEffect } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, type Address } from 'viem'
import { apiService } from '../../../services'
import { usePaymentStore } from '../../../store'
import { validatePayment, getErrorMessage } from '../../../lib/utils'

export function usePayment() {
  const { address, isConnected } = useAccount()
  const { addPayment, setError, setLoadingState } = usePaymentStore()
  const [localError, setLocalError] = useState<string | null>(null)

  const {
    sendTransaction,
    data: hash,
    isPending,
    error: sendError,
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccess && hash && address) {
      setLoadingState('success')
      setLocalError(null)
    }
  }, [isSuccess, hash, address, setLoadingState])

  useEffect(() => {
    if (sendError) {
      const message = getErrorMessage(sendError)
      setLocalError(message)
      setError(message)
      setLoadingState('error')
    }
  }, [sendError, setError, setLoadingState])

  const sendPayment = async (
    recipient: Address,
    amount: string,
    metadata?: string
  ) => {
    if (!isConnected || !address) {
      setLocalError('Please connect your wallet')
      return
    }

    const validation = validatePayment(amount, recipient)
    if (!validation.isValid) {
      setLocalError(validation.errors[0]?.message || 'Invalid payment')
      return
    }

    setLoadingState('loading')
    setLocalError(null)

    try {
      const valueInWei = parseEther(amount)

      sendTransaction(
        {
          to: recipient,
          value: valueInWei,
        },
        {
          onSuccess: async (txHash) => {
            // Log transaction to backend
            try {
              const response = await apiService.logTransaction({
                txHash,
                from: address,
                to: recipient,
                amount,
                value: valueInWei.toString(),
                timestamp: new Date().toISOString(),
                metadata,
              })

              if (response.success && response.transaction) {
                addPayment(response.transaction)
              }
            } catch (error) {
              console.error('Failed to log transaction:', error)
            }
          },
        }
      )
    } catch (error) {
      const message = getErrorMessage(error)
      setLocalError(message)
      setError(message)
      setLoadingState('error')
    }
  }

  return {
    sendPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: localError,
    isLoading: isPending || isConfirming,
  }
}

