import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { type Address } from 'viem'
import PaymentProcessorABI from '../../../contracts/PaymentProcessor.json'
import { CONTRACT_ADDRESSES, ZERO_ADDRESS } from '../../../lib/constants'
import { contractService } from '../../../services'
import type { PaymentRequest, SplitPaymentRequest } from '../../../lib/types'

export function usePaymentContract(chainId: number = 1) {
  const contractAddress = CONTRACT_ADDRESSES[chainId]

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const processPayment = async (request: PaymentRequest) => {
    const args = contractService.preparePaymentArgs(request)

    return writeContract({
      address: contractAddress,
      abi: PaymentProcessorABI.abi,
      functionName: 'processPayment',
      args: [args.payee, args.token, args.amount, args.metadata],
      value: args.token === ZERO_ADDRESS ? args.amount : 0n,
    })
  }

  const createEscrow = async (
    payee: Address,
    amount: string,
    releaseTime: number,
    metadata = ''
  ) => {
    const args = contractService.prepareEscrowArgs(
      payee,
      amount,
      releaseTime,
      metadata
    )

    return writeContract({
      address: contractAddress,
      abi: PaymentProcessorABI.abi,
      functionName: 'createEscrow',
      args: [args.payee, args.token, args.amount, args.releaseTime, args.metadata],
      value: args.amount,
    })
  }

  const releaseEscrow = async (escrowId: string) => {
    return writeContract({
      address: contractAddress,
      abi: PaymentProcessorABI.abi,
      functionName: 'releaseEscrow',
      args: [escrowId],
    })
  }

  const refundEscrow = async (escrowId: string) => {
    return writeContract({
      address: contractAddress,
      abi: PaymentProcessorABI.abi,
      functionName: 'refundEscrow',
      args: [escrowId],
    })
  }

  const splitPayment = async (request: SplitPaymentRequest) => {
    const args = contractService.prepareSplitPaymentArgs(request)

    return writeContract({
      address: contractAddress,
      abi: PaymentProcessorABI.abi,
      functionName: 'splitPayment',
      args: [args.recipients, args.amounts, args.token, args.metadata],
      value: args.totalValue,
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
    contractAddress,
  }
}

export function usePaymentStats(address?: Address, chainId: number = 1) {
  const contractAddress = CONTRACT_ADDRESSES[chainId]

  const { data: totalSent } = useReadContract({
    address: contractAddress,
    abi: PaymentProcessorABI.abi,
    functionName: 'totalSent',
    args: address ? [address] : undefined,
  })

  const { data: totalReceived } = useReadContract({
    address: contractAddress,
    abi: PaymentProcessorABI.abi,
    functionName: 'totalReceived',
    args: address ? [address] : undefined,
  })

  const { data: paymentCount } = useReadContract({
    address: contractAddress,
    abi: PaymentProcessorABI.abi,
    functionName: 'getPaymentCount',
  })

  return {
    totalSent: totalSent as bigint | undefined,
    totalReceived: totalReceived as bigint | undefined,
    paymentCount: paymentCount as number | undefined,
  }
}

