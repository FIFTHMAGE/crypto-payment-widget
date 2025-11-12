import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, type Address } from 'viem'
import PaymentProcessorABI from '../contracts/PaymentProcessor.json'

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as Address

export function usePaymentContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Process direct payment
  const processPayment = async (
    payee: Address,
    amount: string,
    metadata: string = ''
  ) => {
    const value = parseEther(amount)
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: PaymentProcessorABI.abi,
      functionName: 'processPayment',
      args: [payee, '0x0000000000000000000000000000000000000000', value, metadata],
      value,
    })
  }

  // Create escrow payment
  const createEscrow = async (
    payee: Address,
    amount: string,
    releaseTime: number,
    metadata: string = ''
  ) => {
    const value = parseEther(amount)
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: PaymentProcessorABI.abi,
      functionName: 'createEscrow',
      args: [payee, '0x0000000000000000000000000000000000000000', value, releaseTime, metadata],
      value,
    })
  }

  // Release escrow
  const releaseEscrow = async (escrowId: string) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: PaymentProcessorABI.abi,
      functionName: 'releaseEscrow',
      args: [escrowId],
    })
  }

  // Refund escrow
  const refundEscrow = async (escrowId: string) => {
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: PaymentProcessorABI.abi,
      functionName: 'refundEscrow',
      args: [escrowId],
    })
  }

  // Split payment
  const splitPayment = async (
    recipients: Address[],
    amounts: string[],
    metadata: string = ''
  ) => {
    const parsedAmounts = amounts.map(a => parseEther(a))
    const totalValue = parsedAmounts.reduce((sum, val) => sum + val, 0n)
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: PaymentProcessorABI.abi,
      functionName: 'splitPayment',
      args: [recipients, parsedAmounts, '0x0000000000000000000000000000000000000000', metadata],
      value: totalValue,
    })
  }

  return {
    processPayment,
    createEscrow,
    releaseEscrow,
    refundEscrow,
    splitPayment,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    contractAddress: CONTRACT_ADDRESS,
  }
}

// Hook to read contract data
export function usePaymentStats(address?: Address) {
  const { data: totalSent } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PaymentProcessorABI.abi,
    functionName: 'totalSent',
    args: address ? [address] : undefined,
  })

  const { data: totalReceived } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PaymentProcessorABI.abi,
    functionName: 'totalReceived',
    args: address ? [address] : undefined,
  })

  const { data: paymentCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: PaymentProcessorABI.abi,
    functionName: 'getPaymentCount',
  })

  return {
    totalSent,
    totalReceived,
    paymentCount,
  }
}
